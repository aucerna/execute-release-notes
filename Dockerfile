# Build step #1: build the React front end
FROM python
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
RUN python build.py
EXPOSE 80
CMD cd public && python -m http.server 80