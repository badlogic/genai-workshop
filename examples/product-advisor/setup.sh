#!/bin/bash

echo "Creating virtual environment..."
python3.11 -m venv venv

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Setup completed."
