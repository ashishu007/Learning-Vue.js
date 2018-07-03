.SILENT:
.ONESHELL:
.NOTPARALLEL:
.EXPORT_ALL_VARIABLES:
.PHONY: run deps build clean exec test

run: build exec clean

build:
	CGO_ENABLED=0 go build -o bin/app -ldflags '-s -w -extldflags "-static"' main.go

exec:
	./bin/app

clean:
	rm -rf bin
	rm -rf upload

deps:
	go get -u -v ./...

trace: build exec clean
	go tool trace m.trace
