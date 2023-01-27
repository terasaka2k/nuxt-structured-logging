.PHONY: curl-trace-local
curl-trace-local: RANDOM_TRACE_ID=$(shell openssl rand -hex 16)# generate 32 hex characters
curl-trace-local:
	curl localhost:3000/api/log -H "X-Cloud-Trace-Context: $(RANDOM_TRACE_ID)/1;o=1"
