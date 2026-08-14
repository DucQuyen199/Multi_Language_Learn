# Kubernetes / k9s quick start

1. Build and publish the images referenced by `backend.yaml` and `frontend.yaml`.
2. Create a real secret from `secret.example.yaml` through your secret manager.
3. Apply the base:

```bash
kubectl apply -k infra/k8s
kubectl -n lingua-atlas get pods
k9s -n lingua-atlas
```

The MySQL manifest is a single-replica development/early-production baseline. Use a managed MySQL and Redis service, encrypted secrets, ingress/TLS, backups, and a migration job before a high-availability production rollout.
