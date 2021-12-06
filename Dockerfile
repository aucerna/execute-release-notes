# Build step #1: build the React front end
FROM python
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
RUN python build.py
CMD cd public && python -m http.server 80