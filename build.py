import os
import csv
import shutil
import jinja2
from jinja2.loaders import PackageLoader
from jinja2.utils import select_autoescape
import markdown
import frontmatter
import re
import uuid

OUTPUT_DIR = "public"
STATIC_DIR = "static"
SOURCE_DIR = "source"
TEMPLATE_DIR = "templates"

extensions = ['admonition', 'tables']

# clear output folder
if os.path.exists(OUTPUT_DIR):
    shutil.rmtree(OUTPUT_DIR)
os.makedirs(OUTPUT_DIR)

# read release data
releases = []
for release_id in os.listdir(SOURCE_DIR):
    release_path = os.path.join(SOURCE_DIR, release_id)
    summary_file = os.path.join(SOURCE_DIR, release_id, "summary.md")
    items_file = os.path.join(SOURCE_DIR, release_id, "items.csv")

    release = {}
    release["id"] = release_id
    release["source_path"] = release_path

    if os.path.isdir(release_path) and os.path.isfile(summary_file):
        with open(summary_file, 'r') as file:
            summary = frontmatter.loads(file.read())

    for k in summary.keys():
        release[k] = summary[k]

    release["summary_html"] = markdown.markdown(summary.content, extensions=extensions)
    release["items"] = []

    if os.path.exists(items_file):
        with open(items_file,'r') as f:
            headers = f.readline().strip().split(',')
            rdr = csv.reader(f)
            for ln in rdr:
                row = {
                    'weight': 0,
                    'tags': [],
                    'id': uuid.uuid4().hex
                    }
                for i in range(len(headers)):
                    if headers[i] == 'weight':
                        if ln[i] != '':
                            row[headers[i]] = int(ln[i])
                    elif headers[i] == 'tags':
                        row[headers[i]] = filter(lambda x: x, [c.strip() for c in ln[i].split(',')])
                    elif headers[i] == 'detail' and ln[i]:
                        detail_path = os.path.join(release_path, ln[i])
                        detail_file = os.path.join(detail_path, 'summary.md')
                        with open(detail_file, 'r') as file:
                            detail = frontmatter.loads(file.read())
                        content = detail.content
                        content = re.sub(r"!\[(.*?)]\((.*?)\)",f"<a href=\"{ln[i]}/\\2\"><img  alt=\"\\1\" class=\"img-fluid\" src=\"{ln[i]}/\\2\" alt=\"\\1\" /></a>", content)
                        row["detail_html"] = markdown.markdown(content, extension=extensions)
                        for k in detail.keys():
                            row[k] = detail[k]
                    else:
                        row[headers[i]] = ln[i]
                if row["title"]:
                    release["items"].append(row)
    releases.append(release)

env = jinja2.Environment(
    loader=jinja2.FileSystemLoader(TEMPLATE_DIR),
    autoescape=jinja2.select_autoescape()
)

# generate index page
index_template = env.get_template("index.html")
f = open(os.path.join(OUTPUT_DIR, 'index.html'),'w', encoding="utf-8")
f.write(index_template.render(
    title="Aucerna Execute Release Notes",
    releases=releases,
    root="."
    ))
f.close()

# generate release pages
for release in releases:
    # generate release index page
    os.makedirs(os.path.join(OUTPUT_DIR, release['id']))
    template = env.get_template("release.html")
    f = open(os.path.join(OUTPUT_DIR, release['id'], 'index.html'),'w', encoding="utf-8")
    f.write(template.render(
        root="..",
        release=release,
        title=release["title"],
        ))
    f.close()
    for detail_folder in os.listdir(release["source_path"]):
        full_detail_folder = os.path.join(release["source_path"], detail_folder)
        if os.path.isdir(full_detail_folder):
            for f in os.listdir(full_detail_folder):
                if f not in ["summary.md"]:
                    source_file = os.path.join(full_detail_folder, f)
                    os.makedirs(os.path.join(OUTPUT_DIR, release["id"], detail_folder))
                    shutil.copyfile(source_file, os.path.join(OUTPUT_DIR, release["id"], detail_folder, f))

# copy static content
for f in os.listdir(STATIC_DIR):
    shutil.copy(os.path.join(STATIC_DIR, f), OUTPUT_DIR)