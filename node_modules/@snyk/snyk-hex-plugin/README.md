![Snyk logo](https://snyk.io/style/asset/logo/snyk-print.svg)

---

Snyk helps you find, fix and monitor for known vulnerabilities in your dependencies, both on an ad hoc basis and as part of your CI (Build) system.

## Snyk Elixir's Mix Plugin
Given the `mix.exs` manifest and `mix.lock` lock files provided by [Elixir's Mix build tool](https://elixir-lang.org/getting-started/mix-otp/introduction-to-mix.html), using the [Snyk's Mix Parser](https://github.com/snyk/mix-parser), creates a [DepGraph](https://github.com/snyk/dep-graph) object and return an Envelop's ScanResult object. 
