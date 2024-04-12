from flask import Flask, jsonify, request
from flask_cors import CORS
from bot import complete
import uuid
import requests
import requests
from bs4 import BeautifulSoup

chats = {}
texts = {}
questions = {}

def extract_text(url, classes):
    global texts
    if url in texts:
        return texts[url]
    response = requests.get(url)
    if response.status_code != 200:
        return "Failed to retrieve the URL"

    soup = BeautifulSoup(response.text, 'html.parser')
    extractedTexts = []
    for class_name in classes:
        for element in soup.find_all(class_=class_name):
            extractedTexts.append(element.get_text(strip=True))

    text = ' '.join(extractedTexts)
    texts[url] = text
    return text

def extract_questions(url, text):
    if url in questions:
        return questions[url]
    messages = []
    prompt = f"""
    You are provided a text delimited by three backticks:

    ```
    {text}
    ```

    Generate 5 highly likely questions a user or customer could ask that could be answered by
    using the information found in the text.

    Output each question on a separate line. Do not number the questions.
    """
    complete(messages, prompt)
    return messages[-1]["content"].split("\n")

app = Flask(__name__)
CORS(app)
@app.route('/create', methods=['GET'])
def create():
    url = request.args.get('url')  # Get URL parameter from query string
    if not url:
        return jsonify({"error": "URL parameter is missing"}), 400

    id = str(uuid.uuid4())
    extracted_text = extract_text(url, ["c-product-description__part", "c-details-box", "c-review", "c-shop-availability__shop-data"])
    extracted_questions = extract_questions(url, extracted_text)
    questions[url] = extracted_questions

    prompt = f"""
    You are a product adviser. You answer questions about a specific product. Here is the
    product information delimited by three backticks:

    ```
    {extracted_text}
    ```

    Answer questions only based on this information. Always answer the question in the language
    of the question.
    """
    chats[id] = {
        "id": id,
        "messages": [{"role": "system", "content": prompt}],
        "questions": extracted_questions
    }
    return jsonify(chats[id])

@app.route('/turn', methods=['GET'])
def turn():
    id = request.args.get("id")
    message = request.args.get("message")
    if not id in chats:
        return jsonify({"error": "Unknown chat id"}), 400
    messages = chats[id]["messages"]
    complete(messages, message)
    return jsonify({"answer": messages[-1]["content"]})

if __name__ == '__main__':
    app.run(debug=True)