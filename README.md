# Generative AI Workshop

Source code and data for my [generative AI workshop](https://docs.google.com/presentation/d/1GkPuw1YxnnT3aevzjf3XTDNQQy8nN6dV7N3bn8Wg3k4/edit?usp=sharing).

You can open the Jupyter notebooks on Google Colab.

To run the demos locally:

1. Install [Python +3.12](https://www.python.org/downloads/)
1. Install [rye](https://rye-up.com/)
1. ``
1. `git clone https://github.com/badlogic/genai-workshop && cd genai-workshop && rye sync && ./.venv/bin/python3 src/genai_workshop/ipynb_to_py.py`

You can then run the demos via:

```
rye run 01_supervised
rye run 02_unsupervised
rye run 03_unsupervised_embeddings
```
