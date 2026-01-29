export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    try {
      validateEnvironment(env);
      
      if (path === '/') {
        return serveUI();
      } else if (path === '/api/generate' && request.method === 'GET') {
        return await handleGenerateSSE(env);
      } else {
        return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

async function handleGenerateSSE(env) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  
  // Start the generation process
  generateWithProgress(env, writer).finally(() => writer.close());
  
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

async function generateWithProgress(env, writer) {
  try {
    await sendSSE(writer, 'status', '🔍 Querying DevOps for issues...');
    
    const devOpsItems = await fetchDevOpsItems(env);
    await sendSSE(writer, 'status', `✅ Found ${devOpsItems.length} new items from DevOps`);
    
    await sendSSE(writer, 'status', '🌐 Getting current release version...');
    const currentVersionResponse = await fetch('https://updates.aucerna.app/execute/21/current.txt');
    const currentVersion = currentVersionResponse.ok ? (await currentVersionResponse.text()).trim() : '2021.1.302.0';
    
    await sendSSE(writer, 'status', `📦 Current release is ${currentVersion}`);
    await sendSSE(writer, 'status', `🔍 Querying GitHub for commits after ${currentVersion}_master tag...`);
    
    const githubCommits = await fetchGithubCommits(env, devOpsItems);
    const matchedGithubCommits = githubCommits.filter(c => c.itemNumber);
    const standaloneGithubCommits = githubCommits.filter(c => !c.itemNumber);
    
    await sendSSE(writer, 'status', `✅ Found ${matchedGithubCommits.length} commits matching DevOps items and ${standaloneGithubCommits.length} standalone commits`);
    
    // Log specific commits found
    if (matchedGithubCommits.length > 0) {
      await sendSSE(writer, 'status', '📋 GitHub commits linked to DevOps:');
      for (const commit of matchedGithubCommits) {
        await sendSSE(writer, 'status', `  • DevOps #${commit.itemNumber}: ${commit.title.substring(0, 80)}...`);
      }
    }
    
    if (standaloneGithubCommits.length > 0) {
      await sendSSE(writer, 'status', '📋 Standalone GitHub commits:');
      for (const commit of standaloneGithubCommits) {
        await sendSSE(writer, 'status', `  • ${commit.id}: ${commit.title.substring(0, 80)}...`);
      }
    }
    
    // Merge items - GitHub commits should be linked to existing DevOps items by ID
    const itemsMap = new Map();
    devOpsItems.forEach(item => itemsMap.set(item.id.toString(), item));
    
    // Process GitHub commits
    githubCommits.forEach(commit => {
      if (commit.itemNumber && itemsMap.has(commit.itemNumber)) {
        // Link to existing DevOps item
        const existingItem = itemsMap.get(commit.itemNumber);
        existingItem.hasGitHubCommit = true;
        existingItem.gitHubCommitTitle = commit.title;
        existingItem.gitHubCommitDate = commit.commitDate;
      } else if (!commit.itemNumber) {
        // Add standalone GitHub commit as separate item
        itemsMap.set(commit.id, commit);
      }
    });
    
    const allItems = Array.from(itemsMap.values());
    await sendSSE(writer, 'status', `📝 Total items to process: ${allItems.length}`);
    
    // Process with AI
    for (let i = 0; i < allItems.length; i++) {
      await sendSSE(writer, 'status', `🤖 Summarizing item ${i + 1} of ${allItems.length}: ${allItems[i].title.substring(0, 50)}...`);
      
      try {
        const enhanced = await enhanceTitle(allItems[i], env);
        allItems[i].title = enhanced.title;
        allItems[i].type = enhanced.type;
        allItems[i].tags = enhanced.tags;
        
        await sendSSE(writer, 'progress', {
          current: i + 1,
          total: allItems.length,
          item: {
            id: allItems[i].id,
            type: allItems[i].type,
            title: allItems[i].title,
            source: allItems[i].source
          }
        });
      } catch (error) {
        await sendSSE(writer, 'status', `❌ Failed to enhance item ${allItems[i].id}: ${error.message}`);
      }
    }
    
    await sendSSE(writer, 'status', '✅ Generation complete!');
    await sendSSE(writer, 'complete', allItems);
    
  } catch (error) {
    await sendSSE(writer, 'error', error.message);
  }
}

async function sendSSE(writer, type, data) {
  const message = `data: ${JSON.stringify({ type, data })}\n\n`;
  await writer.write(new TextEncoder().encode(message));
}

function serveUI() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Release Notes Generator</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'MS Sans Serif', 'Courier New', monospace;
            background: #008080;
            color: #000000;
            min-height: 100vh;
            padding: 20px;
            background-image: 
                linear-gradient(45deg, #006666 25%, transparent 25%), 
                linear-gradient(-45deg, #006666 25%, transparent 25%), 
                linear-gradient(45deg, transparent 75%, #006666 75%), 
                linear-gradient(-45deg, transparent 75%, #006666 75%);
            background-size: 4px 4px;
            background-position: 0 0, 0 2px, 2px -2px, -2px 0px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: #c0c0c0;
            border: 2px outset #c0c0c0;
            padding: 8px;
            box-shadow: 4px 4px 8px rgba(0,0,0,0.5);
        }
        
        .header {
            text-align: center;
            margin-bottom: 20px;
            background: #000080;
            color: white;
            padding: 8px;
            border: 2px inset #c0c0c0;
            font-weight: bold;
        }
        
        .title {
            font-size: 1.4rem;
            color: #ffff00;
            margin-bottom: 4px;
            text-shadow: 1px 1px 0px #000000;
        }
        
        .subtitle {
            color: #ffffff;
            font-size: 0.8rem;
        }
        
        .generate-btn {
            background: #c0c0c0;
            color: #000000;
            border: 2px outset #c0c0c0;
            padding: 8px 16px;
            font-family: 'MS Sans Serif', sans-serif;
            font-size: 0.8rem;
            font-weight: bold;
            cursor: pointer;
            display: block;
            margin: 0 auto 20px;
            box-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }
        
        .generate-btn:hover {
            background: #d0d0d0;
        }
        
        .generate-btn:active {
            border: 2px inset #c0c0c0;
            background: #a0a0a0;
        }
        
        .generate-btn:disabled {
            background: #808080;
            color: #404040;
            cursor: not-allowed;
            border: 2px inset #c0c0c0;
        }
        
        .terminal {
            background: #000000;
            border: 2px inset #c0c0c0;
            padding: 8px;
            min-height: 200px;
            margin-bottom: 16px;
            font-size: 0.8rem;
            font-family: 'Courier New', monospace;
            line-height: 1.4;
            overflow-y: auto;
            max-height: 300px;
        }
        
        .terminal-line {
            margin-bottom: 2px;
            white-space: pre-wrap;
            word-break: break-word;
        }
        
        .terminal-line.status {
            color: #00ffff;
        }
        
        .terminal-line.success {
            color: #00ff00;
        }
        
        .terminal-line.warning {
            color: #ffff00;
        }
        
        .terminal-line.error {
            color: #ff0000;
        }
        
        .results-container {
            display: none;
        }
        
        .results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding: 8px;
            background: #000080;
            color: white;
            border: 2px inset #c0c0c0;
        }
        
        .results-title {
            color: #ffff00;
            font-size: 1.0rem;
            font-weight: bold;
            text-shadow: 1px 1px 0px #000000;
        }
        
        .copy-csv-btn {
            background: #c0c0c0;
            color: #000000;
            border: 2px outset #c0c0c0;
            padding: 4px 8px;
            font-family: 'MS Sans Serif', sans-serif;
            font-size: 0.7rem;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }
        
        .copy-csv-btn:hover {
            background: #d0d0d0;
        }
        
        .copy-csv-btn:active {
            border: 2px inset #c0c0c0;
            background: #a0a0a0;
        }
        
        .results-table {
            width: 100%;
            border-collapse: collapse;
            background: #ffffff;
            border: 2px inset #c0c0c0;
            font-size: 0.8rem;
            font-family: 'MS Sans Serif', sans-serif;
        }
        
        .results-table th {
            background: #c0c0c0;
            padding: 6px 4px;
            text-align: left;
            font-weight: bold;
            color: #000000;
            border: 1px solid #808080;
            border-right: 2px outset #c0c0c0;
            border-bottom: 2px outset #c0c0c0;
        }
        
        .results-table td {
            padding: 4px;
            border: 1px solid #c0c0c0;
            vertical-align: top;
            background: #ffffff;
            color: #000000;
        }
        
        .results-table tr:hover td {
            background: #0000ff;
            color: #ffffff;
        }
        
        .tag {
            display: inline-block;
            background: #c0c0c0;
            color: #000000;
            padding: 1px 4px;
            font-size: 0.7rem;
            margin: 1px;
            border: 1px outset #c0c0c0;
            font-weight: bold;
        }
        
        .type-bug { 
            background: #ff0000; 
            color: #ffffff; 
            border: 1px outset #ff0000;
        }
        .type-enhancement { 
            background: #0000ff; 
            color: #ffffff; 
            border: 1px outset #0000ff;
        }
        .type-feature { 
            background: #008000; 
            color: #ffffff; 
            border: 1px outset #008000;
        }
        
        .item-source {
            font-size: 0.7rem;
            color: #000000;
            font-weight: bold;
        }
        
        .github-only-row td {
            background: #ffff00 !important;
            color: #000000 !important;
        }
        
        .github-only-row:hover td {
            background: #ff8000 !important;
            color: #000000 !important;
        }
        
        .github-only-warning {
            color: #ff0000;
            font-weight: bold;
        }
        
        .progress-bar {
            background: #c0c0c0;
            border: 2px inset #c0c0c0;
            height: 16px;
            margin: 8px 0;
            overflow: hidden;
        }
        
        .progress-fill {
            background: #0000ff;
            height: 100%;
            width: 0%;
            transition: width 0.3s ease;
            border-right: 2px outset #0000ff;
        }
        
        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #c0c0c0;
            color: #000000;
            padding: 8px 12px;
            border: 2px outset #c0c0c0;
            font-family: 'MS Sans Serif', sans-serif;
            font-size: 0.8rem;
            font-weight: bold;
            z-index: 1000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            box-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        
        .toast.show {
            opacity: 1;
            transform: translateX(0);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">$ release-notes-generator</div>
            <div class="subtitle">Automated release notes from DevOps and GitHub</div>
        </div>
        
        <button class="generate-btn" id="generateBtn" onclick="generateReleaseNotes()">
            ▶ Generate Release Notes
        </button>
        
        <div class="terminal" id="terminal"></div>
        
        <div class="progress-bar" id="progressBar" style="display: none;">
            <div class="progress-fill" id="progressFill"></div>
        </div>
        
        <div class="results-container" id="resultsContainer">
            <div class="results-header">
                <div class="results-title">📋 Generated Release Notes</div>
                <button class="copy-csv-btn" onclick="copyAsCSV()">📄 Copy as CSV</button>
                <button class="copy-csv-btn" onclick="copyAsTSV()" style="margin-left: 8px;">📊 Copy as TSV</button>
            </div>
            <table class="results-table" id="resultsTable">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Item #</th>
                        <th>Title</th>
                        <th>Tags</th>
                        <th>Source</th>
                    </tr>
                </thead>
                <tbody id="resultsBody">
                </tbody>
            </table>
        </div>
    </div>

    <script>
        let generationData = [];
        let eventSource = null;
        
        function addTerminalLine(text, className = '') {
            const terminal = document.getElementById('terminal');
            const line = document.createElement('div');
            line.className = 'terminal-line ' + className;
            line.textContent = '> ' + text;
            terminal.appendChild(line);
            terminal.scrollTop = terminal.scrollHeight;
        }
        
        function updateProgress(current, total) {
            const progressBar = document.getElementById('progressBar');
            const progressFill = document.getElementById('progressFill');
            
            if (total > 0) {
                const percent = (current / total) * 100;
                progressFill.style.width = percent + '%';
                progressBar.style.display = 'block';
            } else {
                progressBar.style.display = 'none';
            }
        }
        
        async function generateReleaseNotes() {
            const btn = document.getElementById('generateBtn');
            const terminal = document.getElementById('terminal');
            const resultsContainer = document.getElementById('resultsContainer');
            
            btn.disabled = true;
            btn.textContent = '⏳ Generating...';
            terminal.innerHTML = '';
            terminal.style.display = 'block';
            resultsContainer.style.display = 'none';
            generationData = [];
            
            addTerminalLine('Initializing release notes generation...', 'status');
            
            try {
                eventSource = new EventSource('/api/generate');
                
                eventSource.onmessage = function(event) {
                    const data = JSON.parse(event.data);
                    
                    switch(data.type) {
                        case 'status':
                            addTerminalLine(data.data, 'status');
                            break;
                        case 'progress':
                            updateProgress(data.data.current, data.data.total);
                            break;
                        case 'complete':
                            generationData = data.data;
                            hideTerminal();
                            showResults(data.data);
                            addTerminalLine(\`✅ Complete! Generated \${data.data.length} release note items.\`, 'success');
                            resetUI();
                            break;
                        case 'error':
                            addTerminalLine('❌ Error: ' + data.data, 'error');
                            resetUI();
                            break;
                    }
                };
                
                eventSource.onerror = function(error) {
                    addTerminalLine('❌ Connection error occurred', 'error');
                    resetUI();
                };
                
            } catch (error) {
                addTerminalLine('❌ Failed to start generation: ' + error.message, 'error');
                resetUI();
            }
        }
        
        function hideTerminal(items) {
            document.getElementById('terminal').style.display = 'None';
        }

        function showResults(items) {
            const tbody = document.getElementById('resultsBody');
            tbody.innerHTML = '';
            
            items.forEach(item => {
                const row = document.createElement('tr');
                const isGithubOnly = item.source === 'github' && !item.itemNumber;
                
                if (isGithubOnly) {
                    row.className = 'github-only-row';
                }
                
                row.innerHTML = \`
                    <td><span class="tag type-\${item.type}">\${item.type}</span></td>
                    <td>\${item.id}</td>
                    <td>\${item.title}</td>
                    <td>\${(item.tags || []).map(tag => \`<span class="tag">\${tag}</span>\`).join('')}</td>
                    <td><span class="item-source \${isGithubOnly ? 'github-only-warning' : ''}">\${item.source}\${isGithubOnly ? ' (no ticket)' : ''}</span></td>
                \`;
                tbody.appendChild(row);
            });
            
            document.getElementById('resultsContainer').style.display = 'block';
        }
        
        function copyAsCSV() {
            const headers = ['type', 'tags', 'title', 'weight', 'detail', 'item#'];
            const rows = [headers];
            
            generationData.forEach(item => {
                rows.push([
                    item.type,
                    \`"\${(item.tags || []).join(',')}"\`,
                    \`"\${item.title.replace(/"/g, '""')}"\`,
                    '',
                    '',
                    item.source === 'github' ? (item.itemNumber || '') : item.id
                ]);
            });
            
            const csv = rows.map(row => row.join(',')).join('\\n');
            navigator.clipboard.writeText(csv).then(() => {
                showToast('Copied to Clipboard');
            });
        }
        
        function copyAsTSV() {
            const headers = ['type', 'tags', 'title', 'weight', 'detail', 'item#'];
            const rows = [headers];
            
            generationData.forEach(item => {
                rows.push([
                    item.type,
                    (item.tags || []).join(','),
                    item.title, // No quotes needed for TSV
                    '',
                    '',
                    item.source === 'github' ? (item.itemNumber || '') : item.id
                ]);
            });
            
            const tsv = rows.map(row => row.join('\\t')).join('\\n');
            navigator.clipboard.writeText(tsv).then(() => {
                showToast('Copied to Clipboard');
            });
        }
        
        function showToast(message) {
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = message;
            document.body.appendChild(toast);
            
            // Trigger animation
            setTimeout(() => toast.classList.add('show'), 10);
            
            // Remove after 3 seconds
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => document.body.removeChild(toast), 300);
            }, 3000);
        }
        
        function resetUI() {
            const btn = document.getElementById('generateBtn');
            btn.disabled = false;
            btn.textContent = '▶ Generate Release Notes';
            updateProgress(0, 0);
            
            if (eventSource) {
                eventSource.close();
                eventSource = null;
            }
        }
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}

function validateEnvironment(env) {
  const required = ['DEVOPS_PAT', 'GITHUB_TOKEN', 'GITHUB_REPO', 'OPENAI_API_KEY', 'DEVOPS_SAVED_QUERY_ID', 'DEVOPS_ORG', 'DEVOPS_PROJECT'];
  const missing = required.filter(key => !env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}

async function fetchDevOpsItems(env) {
  console.log('Fetching DevOps work items using saved query...');
  
  try {
    // Use the saved query to get work item IDs
    const savedQueryId = env.DEVOPS_SAVED_QUERY_ID;
    const queryUrl = `https://dev.azure.com/${env.DEVOPS_ORG}/${env.DEVOPS_PROJECT}/_apis/wit/wiql/${savedQueryId}?api-version=7.0`;
    
    console.log('Making saved query request to:', queryUrl);
    console.log('Using PAT for auth:', env.DEVOPS_PAT?.substring(0, 10) + '...');
    
    const queryResponse = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(':' + env.DEVOPS_PAT)}`,
        'Accept': 'application/json'
      }
    });
    
    console.log('Saved query response status:', queryResponse.status);
    
    if (!queryResponse.ok) {
      const errorText = await queryResponse.text();
      console.error('Saved query API error response:', errorText);
      throw new Error(`Saved query API error: ${queryResponse.status} - ${errorText}`);
    }
    
    const responseText = await queryResponse.text();
    console.log('Saved query raw response:', responseText);
    
    let queryData;
    try {
      queryData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse saved query response as JSON:', parseError);
      throw new Error(`Saved query response is not JSON (status ${queryResponse.status}): ${responseText.substring(0, 200)}...`);
    }
    
    console.log('Saved query response:', JSON.stringify(queryData, null, 2));
    
    if (!queryData.workItems || queryData.workItems.length === 0) {
      console.log('No work items found in saved query');
      return [];
    }
    
    // Get the work item IDs
    const workItemIds = queryData.workItems.map(item => item.id);
    console.log('Found work item IDs:', workItemIds);
    
    // Now fetch the full work item details
    const batchUrl = `https://dev.azure.com/${env.DEVOPS_ORG}/${env.DEVOPS_PROJECT}/_apis/wit/workitems?ids=${workItemIds.join(',')}&api-version=7.0`;
    console.log('Fetching work item details from:', batchUrl);
    
    const detailsResponse = await fetch(batchUrl, {
      headers: {
        'Authorization': `Basic ${btoa(':' + env.DEVOPS_PAT)}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('Work items details response status:', detailsResponse.status);
    
    if (!detailsResponse.ok) {
      const errorText = await detailsResponse.text();
      console.error('Work items API error response:', errorText);
      throw new Error(`Work items API error: ${detailsResponse.status} - ${errorText}`);
    }
    
    const detailsData = await detailsResponse.json();
    console.log('Work items details response structure:', Object.keys(detailsData));
    
    const items = detailsData.value?.map(item => {
      const workItemType = item.fields['System.WorkItemType']?.toLowerCase();
      return {
        id: item.id,
        type: workItemType === 'bug' ? 'bug' : 'enhancement', // Will be inferred by AI later, but bugs stay as bugs
        title: item.fields['System.Title'],
        tags: extractTags(item.fields['System.Tags'] || '', item.fields['System.Title'] || '', item.fields['System.Description'] || '', item.fields['Custom.ReleaseNotes'] || '', item.fields['Custom.ReleaseNotesTitle'] || ''),
        source: 'devops',
        releaseNotes: item.fields['Custom.ReleaseNotes'] || item.fields['Microsoft.VSTS.Common.ReleaseNotes'] || '',
        releaseNotesTitle: item.fields['Custom.ReleaseNotesTitle'] || item.fields['Microsoft.VSTS.Common.ReleaseNotesTitle'] || '',
        description: item.fields['System.Description'] || '',
        workItemType: workItemType, // Store original work item type for AI prompt
        rawData: item
      };
    }) || [];
    
    console.log('Mapped DevOps items:', items);
    return items;
  } catch (error) {
    console.error('Error fetching DevOps items:', error);
    throw error;
  }
}


async function fetchGithubCommits(env, devOpsItems) {
  console.log('=== GITHUB COMMIT FETCHING DEBUG ===');
  
  const devOpsItemIds = devOpsItems.map(item => item.id.toString());
  console.log('🔍 Looking for GitHub commits containing these DevOps item IDs:', devOpsItemIds);
  
  try {
    // Get current release version from updates.aucerna.app
    const currentVersionResponse = await fetch('https://updates.aucerna.app/execute/21/current.txt');
    
    let currentVersion = '2021.1.302.0'; // fallback version
    if (currentVersionResponse.ok) {
      currentVersion = (await currentVersionResponse.text()).trim();
      console.log('✓ Current Execute release version from updates.aucerna.app:', currentVersion);
    } else {
      console.log('❌ Failed to fetch current version, using fallback:', currentVersion);
    }
    
    // Get the tag/commit for this version from GitHub
    let since = '';
    let tagDate = null;
    // If current version doesn't have _master, add it for GitHub tag lookup
    let lastReleaseTag = currentVersion.includes('_master') ? currentVersion : currentVersion + '_master';
    console.log('🏷️  Looking for GitHub tag:', lastReleaseTag);
    
    try {
      // Try to find the tag/commit for this version
      const tagUrl = `https://api.github.com/repos/${env.GITHUB_REPO}/git/refs/tags/${lastReleaseTag}`;
      console.log('📍 Tag lookup URL:', tagUrl);
      
      const tagResponse = await fetch(tagUrl, {
        headers: {
          'Authorization': `token ${env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Release-Note-Generator/1.0'
        }
      });
      
      console.log('🏷️  Tag response status:', tagResponse.status);
      
      if (tagResponse.ok) {
        const tagData = await tagResponse.json();
        console.log('✓ Found tag, object type:', tagData.object.type, 'sha:', tagData.object.sha);
        
        // For lightweight tags, the object.url points directly to the commit
        // For annotated tags, we need to get the tag object first, then the commit
        let targetCommitUrl = tagData.object.url;
        
        if (tagData.object.type === 'tag') {
          // This is an annotated tag, get the tag object to find the actual commit
          console.log('📅 This is an annotated tag, fetching tag object...');
          const annotatedTagResponse = await fetch(tagData.object.url, {
            headers: {
              'Authorization': `token ${env.GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Release-Note-Generator/1.0'
            }
          });
          
          if (annotatedTagResponse.ok) {
            const annotatedTagData = await annotatedTagResponse.json();
            console.log('📅 Tag creation date:', annotatedTagData.tagger?.date);
            console.log('📅 Tag target commit:', annotatedTagData.object.sha);
            targetCommitUrl = annotatedTagData.object.url;
            
            // Use tag creation date, not commit date
            if (annotatedTagData.tagger?.date) {
              tagDate = annotatedTagData.tagger.date;
              const afterTagDate = new Date(tagDate);
              afterTagDate.setSeconds(afterTagDate.getSeconds() + 1);
              since = `&since=${afterTagDate.toISOString()}`;
              console.log('✅ Using tag creation date:', tagDate);
              console.log('✅ Will fetch commits AFTER:', afterTagDate.toISOString());
            }
          }
        }
        
        // If we haven't set the date yet, use the commit date
        if (!tagDate) {
          console.log('📅 Fetching commit details from:', targetCommitUrl);
          const commitResponse = await fetch(targetCommitUrl, {
            headers: {
              'Authorization': `token ${env.GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Release-Note-Generator/1.0'
            }
          });
          
          console.log('📅 Commit details response status:', commitResponse.status);
          
          if (commitResponse.ok) {
            const commitData = await commitResponse.json();
            const commitDate = commitData.committer?.date || commitData.author?.date;
            tagDate = commitDate;
            
            // Add 1 second to ensure we get commits AFTER the tag
            const afterTagDate = new Date(commitDate);
            afterTagDate.setSeconds(afterTagDate.getSeconds() + 1);
            const afterTagISO = afterTagDate.toISOString();
            
            since = `&since=${afterTagISO}`;
            console.log('✓ Using commit date:', commitDate);
            console.log('✅ Will fetch commits AFTER:', afterTagISO);
          }
        }
      } else {
        const errorText = await tagResponse.text();
        console.log('❌ Tag not found, response:', errorText.substring(0, 200));
        console.log('⚠️  Falling back to 30 days');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        since = `&since=${thirtyDaysAgo.toISOString()}`;
        tagDate = thirtyDaysAgo.toISOString();
        console.log('📅 Fallback date:', tagDate);
      }
    } catch (tagError) {
      console.log('❌ Error finding tag:', tagError.message);
      console.log('⚠️  Falling back to 30 days');
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      since = `&since=${thirtyDaysAgo.toISOString()}`;
      tagDate = thirtyDaysAgo.toISOString();
      console.log('📅 Fallback date:', tagDate);
    }
    
    // Fetch commits since the last release
    const commitsUrl = `https://api.github.com/repos/${env.GITHUB_REPO}/commits?sha=master${since}&per_page=100`;
    console.log('🔍 Commits URL:', commitsUrl);
    console.log('📊 Fetching commits AFTER date:', tagDate);
    
    const commitsResponse = await fetch(commitsUrl, {
      headers: {
        'Authorization': `token ${env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Release-Note-Generator/1.0'
      }
    });
    
    console.log('GitHub commits API response status:', commitsResponse.status);
    
    if (!commitsResponse.ok) {
      const errorText = await commitsResponse.text();
      console.error('GitHub API error response:', errorText);
      throw new Error(`GitHub API error: ${commitsResponse.status} - ${errorText}`);
    }
    
    const commits = await commitsResponse.json();
    console.log(`📊 Fetched ${commits.length} raw commits from GitHub`);
    console.log(`🔍 Filtering commits after tag date: ${tagDate}`);
    
    // Log first few commits for debugging with date comparison
    console.log('🔍 Examining first few commits for AB# patterns:');
    commits.slice(0, 5).forEach((commit, i) => {
      const title = commit.commit.message.split('\n')[0];
      const commitDate = commit.commit.committer.date;
      const isAfterTag = tagDate ? new Date(commitDate) > new Date(tagDate) : true;
      const hasAB = /AB#\d+/i.test(title);
      console.log(`📝 Commit ${i + 1}: "${title}" (${commitDate}) - After tag: ${isAfterTag}, Contains AB#: ${hasAB}`);
    });
    
    // Process all commits after the tag date
    const allValidCommits = [];
    
    commits.forEach((commit) => {
      const fullMessage = commit.commit.message;
      const title = fullMessage.split('\n')[0];
      const commitDate = commit.commit.committer.date;
      
      // Additional client-side date filtering to ensure we only get commits after the tag
      if (tagDate) {
        const commitDateTime = new Date(commitDate);
        const tagDateTime = new Date(tagDate);
        const isAfterTag = commitDateTime > tagDateTime;
        
        if (!isAfterTag) {
          console.log(`🚫 Excluding commit - made BEFORE tag (${commitDate} <= ${tagDate}): "${title}"`);
          return;
        }
      }
      
      // Check if this commit title contains any of our DevOps item IDs
      const matchedItemId = devOpsItemIds.find(itemId => {
        // Look for AB#{itemId} or just {itemId} in the title
        const hasABPrefix = title.includes(`AB#${itemId}`);
        const hasPlainNumber = title.includes(itemId);
        return hasABPrefix || hasPlainNumber;
      });
      
      if (matchedItemId) {
        console.log(`✅ Found commit for DevOps item ${matchedItemId}: "${title}" (${commitDate})`);
      } else {
        console.log(`📝 Found commit without DevOps match: "${title}" (${commitDate})`);
      }
      
      allValidCommits.push({
        id: matchedItemId || commit.sha.substring(0, 8),
        type: 'enhancement', // Will be inferred by AI later
        title: title,
        tags: extractTags('', title, fullMessage),
        source: 'github',
        rawData: commit,
        itemNumber: matchedItemId || '', // Empty string if no match
        commitDate: commitDate
      });
    });
    
    const filteredCommits = allValidCommits;
    
    const matchedCommits = filteredCommits.filter(c => c.itemNumber);
    const unmatchedCommits = filteredCommits.filter(c => !c.itemNumber);
    
    console.log(`✅ Found ${matchedCommits.length} commits matching DevOps items and ${unmatchedCommits.length} standalone commits AFTER tag date`);
    console.log('📋 Matched commits:');
    matchedCommits.forEach(commit => {
      console.log(`  - DevOps #${commit.itemNumber}: ${commit.title} (${commit.commitDate})`);
    });
    
    if (unmatchedCommits.length > 0) {
      console.log('📋 Standalone commits:');
      unmatchedCommits.forEach(commit => {
        console.log(`  - ${commit.id}: ${commit.title} (${commit.commitDate})`);
      });
    }
    
    return filteredCommits;
  } catch (error) {
    console.error('Error fetching GitHub commits:', error);
    throw error;
  }
}


async function enhanceTitle(item, env) {
  console.log('Making OpenAI request for item:', item.id);
  
  // Build context for AI based on available information
  let context = `Title: ${item.title}\nSource: ${item.source}`;
  
  if (item.workItemType) {
    context += `\nDevOps Work Item Type: ${item.workItemType}`;
  }
  
  if (item.releaseNotesTitle) {
    context += `\nRelease Notes Title: ${item.releaseNotesTitle}`;
  }
  
  if (item.releaseNotes) {
    context += `\nExisting Release Notes: ${item.releaseNotes}`;
  }
  
  if (item.description) {
    context += `\nDescription: ${item.description.substring(0, 1000)}${item.description.length > 1000 ? '...' : ''}`;
  }
  
  const prompt = `Based on the following item information, please provide:
1. A detailed, conversational release note description
2. The item type: "bug", "enhancement", or "feature"
3. Appropriate tags from the predefined list

${context}

Guidelines:
- PRIORITY ORDER for content: 1) Release Notes Title (if present), 2) Existing Release Notes, 3) Generate from Title/Description
- If "Release Notes Title" exists, use it as the primary source and expand on it
- If "Existing Release Notes" exist, use them as the foundation and enhance with more detail
- Use the Description field to add context and detail to your release note
- Write for super users who understand the application but not technical details
- Write concise, complete sentences that explain the change clearly
- Keep descriptions to 1-2 sentences maximum - be direct and focused
- Use a conversational but professional tone
- Explain what the change means for users without unnecessary detail
- NEVER include company names, staff names, or specific internal references
- Use generic scenarios if needed: "when multiple users edit the same document" not "when Jim edits the document"
- A touch of gentle humor is welcome but keep it brief and generic
- For type classification: IMPORTANT - If "DevOps Work Item Type" is "bug", you MUST classify as "bug". Otherwise: "bug" = fixes/corrections, "enhancement" = improvements to existing features, "feature" = MAJOR new functionality.  In general, most new things are enhancements unless they sound big and impressive.
- Always write complete sentences that can stand alone as release note items

For tags, select 1-3 most appropriate tags from this EXACT list (use these exact strings):
security, manual step, integration, afe, well, workflow, opsched, budget, well delivery, integration agent, wellez, enersight, peloton, valnav, dashboard, attachments, admin, system, plugins, reporting, formula, api, performance, loader, odata, saas, ui, email

Tag selection hints:
- "afe" for AFE-related functionality
- "well delivery" for well operations or RTx or Job
- "workflow" for process/task-related changes or anything referencing workflows
- "budget" for capital management, budgeting and forecasting and projects
- "dashboard" for the main landing page
- "admin" for administrative functions
- "system" for core system changes (default if unsure)
- "ui" for user interface improvements
- "api" for integration/API changes
- "performance" for speed/optimization improvements
- "security" for security-related changes
- "reporting" for report generation features
- Product names: "wellez", "enersight", "peloton", "valnav" for those specific integrations

Respond in JSON format:
{
  "title": "your detailed release note description here",
  "type": "bug|enhancement|feature",
  "tags": ["tag1", "tag2"]
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.3
      })
    });
    
    console.log('OpenAI response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      const responseText = data.choices[0]?.message?.content?.trim();
      
      try {
        // Remove markdown code blocks if present
        let cleanedResponse = responseText;
        if (responseText.includes('```json')) {
          cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```/g, '').trim();
        } else if (responseText.includes('```')) {
          cleanedResponse = responseText.replace(/```\n?/g, '').trim();
        }
        
        const result = JSON.parse(cleanedResponse);
        console.log('OpenAI result:', result);
        // Normalize tags: handle both array and semicolon/comma-separated string formats
        let tags = result.tags || item.tags || ['system'];
        if (typeof tags === 'string') {
          tags = tags.split(/[;,]/).map(t => t.trim()).filter(t => t);
        }
        return {
          title: result.title || item.title,
          type: result.type || item.type,
          tags: tags
        };
      } catch (parseError) {
        console.warn('Failed to parse OpenAI JSON response:', responseText);
        return { 
          title: item.title, 
          type: item.type, 
          tags: item.tags || ['system'] 
        };
      }
    } else {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return { 
        title: item.title, 
        type: item.type, 
        tags: item.tags || ['system'] 
      };
    }
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return { 
      title: item.title, 
      type: item.type, 
      tags: item.tags || ['system'] 
    };
  }
}

function extractTags(tagString, title = '', description = '', releaseNotes = '', releaseNotesTitle = '') {
  console.log('Extracting tags from:', { tagString, title: title.substring(0, 50), description: description.substring(0, 50) });
  
  const tags = [];
  
  // Combine all text content for analysis
  const allContent = `${tagString} ${title} ${description} ${releaseNotes} ${releaseNotesTitle}`.toLowerCase();
  
  // Basic tag mappings from existing tag fields
  const basicTagMap = {
    'admin': 'admin',
    'afe': 'afe', 
    'budget': 'budget',
    'well': 'well delivery',
    'delivery': 'well delivery',
    'system': 'system',
    'security': 'security'
  };
  
  // Check basic tags
  Object.entries(basicTagMap).forEach(([key, value]) => {
    if (allContent.includes(key)) {
      if (!tags.includes(value)) tags.push(value);
    }
  });
  
  // Content-based tag hints
  const contentHints = {
    'workflow': ['workflow', 'task', 'job'],
    'budget': ['project'], // "budget" already covered above, but "project" should also trigger it
    'afe': ['afe'] // This will catch "AFE" (case insensitive)
  };
  
  Object.entries(contentHints).forEach(([tag, keywords]) => {
    keywords.forEach(keyword => {
      if (allContent.includes(keyword)) {
        if (!tags.includes(tag)) tags.push(tag);
      }
    });
  });
  
  // Default to 'system' if no tags found
  const result = tags.length > 0 ? [...new Set(tags)] : ['system']; // Remove duplicates
  console.log('Extracted tags:', result);
  return result;
}



