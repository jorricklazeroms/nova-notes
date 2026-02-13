.PHONY: dev build lint test

dev:
	python -m pip install --upgrade pip
	pip install -e .[dev]

build:
	python -m build

lint:
	ruff check .

test:
	pytest -q
