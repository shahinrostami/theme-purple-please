# snyk/snyk-docker-pull

A library that pulls container image layers

TODO interface documentation

### Tests

Set up your local env with the following env vars (see 1Password `DRA env`):
```
export SNYK_DRA_AZURE_USERNAME=snykgoof
export SNYK_DRA_AZURE_PASSWORD=<See 1password: Development/Azure Container Registry (ACR) - Docker Registry Agent>
export SNYK_DRA_AZURE_REPOSITORY=snykgoof/azure-goof
export SNYK_DRA_AZURE_REGISTRY_BASE=snykgoof.azurecr.io

export SNYK_DRA_DOCKER_HUB_USERNAME=snykgoof
export SNYK_DRA_DOCKER_HUB_PASSWORD=<See 1password>
export SNYK_DRA_DOCKER_HUB_REPOSITORY=snykgoof/dockerhub-goof
export SNYK_DRA_DOCKER_HUB_REGISTRY_BASE=registry-1.docker.io

export SNYK_DRA_ELASTIC_ACCESS_KEY_ID=AKIAJICAGDWS3GILA5WA
export SNYK_DRA_ELASTIC_SECRET_ACCESS_KEY=<See 1password: Development/Elastic Container Registry (ECR) - Docker Registry Agent>
export SNYK_DRA_ELASTIC_REGION=eu-west-3
```
To run the tests:

```console
$ npm run test
```

### Linting and formatting

> Note: Linting tasks are also run as part of the test run. However, due to
> their execution speed, it can be useful to run them as you develop, to keep
> your code organised.

To run the code formatting tasks:

```console
$ npm run format
```

To run the linting tasks:

```console
$ npm run lint
```
