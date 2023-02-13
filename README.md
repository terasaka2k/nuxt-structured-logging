## Nuxt.jsでStructured Logging

のサンプル。

https://github.com/terasaka2k/structured-logging-gcp-example と同様（Nuxt.jsバージョン）。


see [modules/gcp-log/README.md](modules/gcp-log/README.md)


### example
```bash
GOOGLE_CLOUD_PROJECT=dummy-local npm run dev
```

```bash
$ make curl-trace-local

# npm run devのところに
{"timestamp":{"seconds":1674803032,"nanos":752000093},"severity":"WARNING","logging.googleapis.com/insertId":".........0ANi9J7j8K2ptyThGru0RY9","logging.googleapis.com/trace":"projects/dummy-local/traces/78b2a80fd28c2715a25fcb5805fce74c/1;o=1","message":"world from server","logName":"projects/dummy-local/logs/structured-log","resource":{"type":"global"}}
```


#### Cloud Run
```bash
GOOGLE_CLOUD_PROJECT=<YOUR GCP> make deploy-dev
```
