# Docker and Kubernetes

Generated from `entries/` in https://github.com/willor16/caniundo. Do not edit by hand.

- `docker compose down -v`: NO
- `docker compose down`: PARTLY
- `docker rm -f db`: NO
- `docker rmi shop:1.0`: PARTLY
- `docker system prune`: PARTLY
- `docker volume prune`: NO
- `docker volume rm shop_data`: NO
- `helm uninstall shop`: PARTLY
- `kubectl delete namespace shop`: NO
- `kubectl delete pvc shop-data`: NO
- `kubectl delete deployment shop`: PARTLY

## docker compose down -v

**NO** · Stop a project and delete its volumes · id `docker-compose-down-volumes`

- **Matches:** `docker compose down`, with `-v` or `--volumes`; or `docker-compose down`, with `-v` or `--volumes`; or `podman compose down`, with `-v` or `--volumes`
- **More specific than:** `docker compose down`
- **Lost:** The volumes of the project, which usually hold its database. Volumes marked as external are kept.
- **Instead:** Without -v, the volumes stay.

    ```sh
    docker compose down
    ```

  To go back:

    ```sh
    docker compose up --detach
    ```
- **Evidence:** Tested: Docker 29.4.2, Linux, 2026-11-26
- **Source:** https://docs.docker.com/reference/cli/docker/compose/down/ (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/docker-compose-down-volumes/ (Spanish: https://willor16.github.io/caniundo/es/c/docker-compose-down-volumes/)

## docker compose down

**PARTLY** · Stop a project and delete its containers · id `docker-compose-down`

- **Matches:** `docker compose down`; or `docker-compose down`; or `podman compose down`
- **Everyday command:** mention it only when asked, or when it matters.
- **Lost:** What the containers wrote outside their volumes.
- **Kept:** The volumes and the images.
- **To undo:** The project, with the data of its volumes.

    ```sh
    docker compose up --detach
    ```
- **Evidence:** Documented, not tested
- **Source:** https://docs.docker.com/reference/cli/docker/compose/down/ (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/docker-compose-down/ (Spanish: https://willor16.github.io/caniundo/es/c/docker-compose-down/)

## docker rm -f db

**NO** · Delete a container · id `docker-rm`

- **Matches:** `docker rm`; or `docker container rm`; or `docker container remove`; or `docker container prune`; or `podman rm`; or `podman container rm`; or `podman container prune`; or `docker compose rm`
- **Lost:** What the container wrote outside its volumes. With -v, also its anonymous volumes.
- **Instead:** Stop it, which keeps everything.

    ```sh
    docker stop <container>
    ```

  To go back:

    ```sh
    docker start <container>
    ```
- **Evidence:** Tested: Docker 29.4.2, Linux, 2026-11-26
- **Source:** https://docs.docker.com/reference/cli/docker/container/rm/ (checked 2026-11-25)
- **Source:** https://docs.docker.com/engine/storage/ (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/docker-rm/ (Spanish: https://willor16.github.io/caniundo/es/c/docker-rm/)

## docker rmi shop:1.0

**PARTLY** · Delete an image · id `docker-rmi`

- **Matches:** `docker rmi`; or `docker image rm`; or `docker image remove`; or `docker image prune`; or `podman rmi`; or `podman image rm`; or `podman image prune`
- **Everyday command:** mention it only when asked, or when it matters.
- **Lost:** Images that were built here and never pushed. They have to be built again.
- **Kept:** The copies in a registry.
- **To undo:** The image, if it exists in a registry.

    ```sh
    docker pull <image>
    ```
- **Evidence:** Documented, not tested
- **Source:** https://docs.docker.com/reference/cli/docker/image/rm/ (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/docker-rmi/ (Spanish: https://willor16.github.io/caniundo/es/c/docker-rmi/)

## docker system prune

**PARTLY** · Delete what Docker is not using · id `docker-system-prune`

- **Matches:** `docker system prune`; or `podman system prune`
- **Lost:** Stopped containers, with what they wrote. With --volumes, also unused anonymous volumes.
- **Kept:** Volumes with a name.
- **To undo:** Images that exist in a registry. The ones built here have to be built again.

    ```sh
    docker pull <image>
    ```
- **Evidence:** Documented, not tested
- **Source:** https://docs.docker.com/reference/cli/docker/system/prune/ (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/docker-system-prune/ (Spanish: https://willor16.github.io/caniundo/es/c/docker-system-prune/)

## docker volume prune

**NO** · Delete the volumes that no container uses · id `docker-volume-prune`

- **Matches:** `docker volume prune`; or `podman volume prune`
- **Lost:** Unused anonymous volumes. With --all, also the ones with a name, such as the database of a project that is stopped.
- **Instead:** See the list first: docker volume ls --filter dangling=true
- **Evidence:** Documented, not tested
- **Source:** https://docs.docker.com/reference/cli/docker/volume/prune/ (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/docker-volume-prune/ (Spanish: https://willor16.github.io/caniundo/es/c/docker-volume-prune/)

## docker volume rm shop_data

**NO** · Delete a volume · id `docker-volume-rm`

- **Matches:** `docker volume rm`; or `docker volume remove`; or `podman volume rm`
- **Lost:** Everything in the volume.
- **Before:** Copy what is inside, for example with docker cp from a container that uses it.
- **Evidence:** Documented, not tested
- **Source:** https://docs.docker.com/reference/cli/docker/volume/rm/ (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/docker-volume-rm/ (Spanish: https://willor16.github.io/caniundo/es/c/docker-volume-rm/)

## helm uninstall shop

**PARTLY** · Uninstall a Helm release · id `helm-uninstall`

- **Matches:** `helm uninstall`, not with `--dry-run`; or `helm delete`, not with `--dry-run`; or `helm un`, not with `--dry-run`; or `helm del`, not with `--dry-run`
- **Lost:** The history of the release and the values that you did not keep in a file.
- **Instead:** --keep-history keeps the history. helm get values shows the values.
- **To undo:** The release again, with the values you have.

    ```sh
    helm install <release> <chart> --values <file>
    ```
- **Evidence:** Documented, not tested
- **Source:** https://helm.sh/docs/helm/helm_uninstall/ (checked 2026-11-25)
- **Source:** https://helm.sh/docs/helm/helm_install/ (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/helm-uninstall/ (Spanish: https://willor16.github.io/caniundo/es/c/helm-uninstall/)

## kubectl delete namespace shop

**NO** · Delete a namespace · id `kubectl-delete-namespace`

- **Matches:** `kubectl delete namespace`, not with `--dry-run`; or `kubectl delete namespaces`, not with `--dry-run`; or `kubectl delete ns`, not with `--dry-run`; or `oc delete project`, not with `--dry-run`; or `kubectl delete`, not with `--dry-run`, with an argument like `ns/*`, `namespace/*`, `namespaces/*`
- **More specific than:** `kubectl delete deployment shop`
- **Lost:** Everything in it, including secrets and the requests for volumes.
- **Before:** See what it has: kubectl get all --namespace <name>. That list leaves out secrets and volumes.
- **Evidence:** Documented, not tested
- **Source:** https://kubernetes.io/docs/tasks/administer-cluster/namespaces/ (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/kubectl-delete-namespace/ (Spanish: https://willor16.github.io/caniundo/es/c/kubectl-delete-namespace/)

## kubectl delete pvc shop-data

**NO** · Delete a volume from a cluster · id `kubectl-delete-volume`

- **Matches:** `kubectl delete pvc`, not with `--dry-run`; or `kubectl delete persistentvolumeclaim`, not with `--dry-run`; or `kubectl delete persistentvolumeclaims`, not with `--dry-run`; or `kubectl delete pv`, not with `--dry-run`; or `kubectl delete persistentvolume`, not with `--dry-run`; or `kubectl delete persistentvolumes`, not with `--dry-run`; or `kubectl delete`, not with `--dry-run`, with an argument like `pvc/*`, `persistentvolumeclaim/*`, `pv/*`, `persistentvolume/*`
- **More specific than:** `kubectl delete deployment shop`
- **Lost:** The disk and its data, with the usual reclaim policy, which is Delete.
- **Before:** Change the reclaim policy of the volume to Retain, and take a snapshot.
- **Evidence:** Documented, not tested
- **Source:** https://kubernetes.io/docs/concepts/storage/persistent-volumes/ (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/kubectl-delete-volume/ (Spanish: https://willor16.github.io/caniundo/es/c/kubectl-delete-volume/)

## kubectl delete deployment shop

**PARTLY** · Delete an object from a cluster · id `kubectl-delete`

- **Matches:** `kubectl delete`, not with `--dry-run`; or `oc delete`, not with `--dry-run`
- **Lost:** Whatever is only in the cluster. If it owns volumes, maybe their data too.
- **Kept:** The manifest, if you have it in a file.
- **Before:** Save it: kubectl get <kind> <name> --output yaml
- **To undo:** The object, as it is in its manifest.

    ```sh
    kubectl apply --filename <manifest>
    ```
- **Evidence:** Documented, not tested
- **Source:** https://kubernetes.io/docs/reference/kubectl/generated/kubectl_delete/ (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/kubectl-delete/ (Spanish: https://willor16.github.io/caniundo/es/c/kubectl-delete/)
