.PHONY: up down console

up:
	docker compose up -d --build
	@echo "Dev server: http://localhost:5174 (a few seconds after a start, while packages install)"

down:
	docker compose down

console:
	docker exec -ti times bash
