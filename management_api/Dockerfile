FROM python:3.10-slim

WORKDIR /app

COPY . .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

ENV PORT=8080

CMD ["gunicorn", "-b", ":8080", "main:app"]