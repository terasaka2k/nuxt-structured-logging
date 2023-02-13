.PHONY: curl-trace-local
curl-trace-local: RANDOM_TRACE_ID=$(shell openssl rand -hex 16)# generate 32 hex characters
curl-trace-local:
	curl localhost:3000/api/log -H "X-Cloud-Trace-Context: $(RANDOM_TRACE_ID)/1;o=1"




IMAGE = us-central1-docker.pkg.dev/$(GOOGLE_CLOUD_PROJECT)/struct-log-docker/nuxt

.PHONY: deploy-dev
deploy-dev:
	env DOCKER_BUILDKIT=1 docker image build -t $(IMAGE) .
	docker image push $(IMAGE)
	gcloud --project=$(GOOGLE_CLOUD_PROJECT) run deploy struct-log --image=$(IMAGE) \
		--max-instances=1 --min-instances=0 --cpu=1 --memory=512Mi --region=us-central1 \
		--allow-unauthenticated
