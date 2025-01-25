up:
	docker compose up -d --build

down:
	docker compose down

console:
	docker exec -ti times bash
