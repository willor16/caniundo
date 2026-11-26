#!/usr/bin/env node

// <define:__CANIUNDO_ENTRIES__>
var define_CANIUNDO_ENTRIES_default = [{ id: "aws-dynamodb-delete", tool: "aws", example: "aws dynamodb delete-table --table-name orders", title: { en: "Delete a DynamoDB table", es: "Borrar una tabla de DynamoDB" }, match: [{ run: ["aws", "dynamodb", "delete-table"] }], verdict: "partly", interrupt: !0, overrides: [], loses: { en: "The table, if point-in-time recovery was off and there is no backup.", es: "La tabla, si la recuperaci\xF3n a un punto en el tiempo estaba desactivada y no hay copia." }, keeps: { en: "With that recovery on, a copy that AWS makes when the table is deleted.", es: "Con esa recuperaci\xF3n activada, una copia que AWS hace al borrar la tabla." }, recover: [{ id: "backup", gives: { en: "The table. Its alarms, policies and tags have to be set up again.", es: "La tabla. Hay que volver a configurar sus alarmas, pol\xEDticas y etiquetas." }, run: ["aws dynamodb restore-table-from-backup --target-table-name <table> --backup-arn <backup>"], until: { en: "35 days, for the copy that AWS makes.", es: "35 d\xEDas, para la copia que hace AWS." } }], autocommit: !1, sources: [{ url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/PointInTimeRecovery_Howitworks.html", checked: "2026-11-25" }, { url: "https://docs.aws.amazon.com/cli/latest/reference/dynamodb/restore-table-from-backup.html", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "aws-ec2-terminate", tool: "aws", example: "aws ec2 terminate-instances --instance-ids i-0abc", title: { en: "Delete an EC2 server", es: "Borrar un servidor de EC2" }, match: [{ run: ["aws", "ec2", "terminate-instances"], without: [["--dry-run"]] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "The server and its main disk. Other disks created with it from the command line too, unless DeleteOnTermination is off.", es: "El servidor y su disco principal. Tambi\xE9n otros discos creados con \xE9l desde la l\xEDnea de comandos, salvo que DeleteOnTermination est\xE9 desactivado." }, recover: [], instead: { note: { en: "Stop it. That still erases instance store disks.", es: "Detenlo. Eso s\xED borra los discos de tipo instance store." }, run: ["aws ec2 stop-instances --instance-ids <instance>"], back: ["aws ec2 start-instances --instance-ids <instance>"] }, autocommit: !1, sources: [{ url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/terminating-instances.html", checked: "2026-11-25" }, { url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/preserving-volumes-on-termination.html", checked: "2026-11-25" }, { url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Stop_Start.html", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "aws-kms-delete", tool: "aws", example: "aws kms schedule-key-deletion --key-id 1234", title: { en: "Schedule the deletion of an encryption key", es: "Programar el borrado de una clave de cifrado" }, match: [{ run: ["aws", "kms", "schedule-key-deletion"] }], verdict: "yes", interrupt: !0, overrides: [], loses: { en: "Nothing until the date. After that, what was encrypted with the key cannot be read.", es: "Nada hasta la fecha. Despu\xE9s, lo cifrado con esa clave no se puede leer." }, recover: [{ id: "cancel", gives: { en: "The key. It stays disabled until the second command.", es: "La clave. Queda desactivada hasta el segundo comando." }, run: ["aws kms cancel-key-deletion --key-id <key>", "aws kms enable-key --key-id <key>"], until: { en: "Until the waiting period ends, from 7 to 30 days.", es: "Hasta que termine el plazo, de 7 a 30 d\xEDas." } }], autocommit: !1, sources: [{ url: "https://docs.aws.amazon.com/kms/latest/developerguide/deleting-keys.html", checked: "2026-11-25" }, { url: "https://docs.aws.amazon.com/cli/latest/reference/kms/cancel-key-deletion.html", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "aws-rds-delete-no-snapshot", tool: "aws", example: "aws rds delete-db-instance --db-instance-identifier shop --skip-final-snapshot", title: { en: "Delete a database in RDS without a last copy", es: "Borrar una base de datos de RDS sin una \xFAltima copia" }, match: [{ run: ["aws", "rds", "delete-db-instance"], with: [["--skip-final-snapshot"]] }, { run: ["aws", "rds", "delete-db-cluster"], with: [["--skip-final-snapshot"]] }], verdict: "no", interrupt: !0, overrides: ["aws-rds-delete"], loses: { en: "The data since the last manual snapshot, or all of it if there is none. Automated backups too, unless you choose to keep them.", es: "Los datos desde la \xFAltima instant\xE1nea manual, o todos si no hay. Tambi\xE9n las copias autom\xE1ticas, salvo que elijas conservarlas." }, keeps: { en: "Manual snapshots. AWS Support may be able to help within six days.", es: "Las instant\xE1neas manuales. El soporte de AWS quiz\xE1 pueda ayudar en los primeros seis d\xEDas." }, recover: [], instead: { note: { en: "Use --final-db-snapshot-identifier, so that a last copy stays.", es: "Usa --final-db-snapshot-identifier, para que quede una \xFAltima copia." }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_DeleteInstance.html", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "aws-rds-delete", tool: "aws", example: "aws rds delete-db-instance --db-instance-identifier shop --final-db-snapshot-identifier shop-last", title: { en: "Delete a database in RDS", es: "Borrar una base de datos de RDS" }, match: [{ run: ["aws", "rds", "delete-db-instance"] }, { run: ["aws", "rds", "delete-db-cluster"] }], verdict: "partly", interrupt: !0, overrides: [], loses: { en: "The server and its address. Automated backups too, unless you choose to keep them.", es: "El servidor y su direcci\xF3n. Tambi\xE9n las copias autom\xE1ticas, salvo que elijas conservarlas." }, keeps: { en: "The final snapshot and the manual ones.", es: "La instant\xE1nea final y las manuales." }, recover: [{ id: "snapshot", gives: { en: "A new database with the data of the snapshot.", es: "Una base nueva con los datos de la instant\xE1nea." }, run: ["aws rds restore-db-instance-from-db-snapshot --db-instance-identifier <new-name> --db-snapshot-identifier <snapshot>"] }], autocommit: !1, sources: [{ url: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_DeleteInstance.html", checked: "2026-11-25" }, { url: "https://docs.aws.amazon.com/cli/latest/reference/rds/restore-db-instance-from-db-snapshot.html", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "aws-s3-bucket-delete", tool: "aws", example: "aws s3 rb s3://shop-photos --force", title: { en: "Delete an S3 bucket", es: "Borrar un bucket de S3" }, match: [{ run: ["aws", "s3", "rb"] }, { run: ["aws", "s3api", "delete-bucket"] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "The bucket, and with --force its objects. Another account can take its name.", es: "El bucket y, con --force, sus objetos. Otra cuenta puede quedarse con su nombre." }, recover: [], autocommit: !1, sources: [{ url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/delete-bucket.html", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "aws-s3-delete", tool: "aws", example: "aws s3 rm s3://shop-photos --recursive", title: { en: "Delete objects from S3", es: "Borrar objetos de S3" }, match: [{ run: ["aws", "s3", "rm"], without: [["--dryrun"]] }, { run: ["aws", "s3", "sync"], with: [["--delete"]], without: [["--dryrun"]] }, { run: ["aws", "s3api", "delete-object"] }, { run: ["aws", "s3api", "delete-objects"] }], verdict: "partly", interrupt: !0, overrides: [], loses: { en: "The objects, forever, if the bucket has no versioning.", es: "Los objetos, para siempre, si el bucket no tiene versiones." }, keeps: { en: "The old versions, if versioning was on before.", es: "Las versiones anteriores, si ya las ten\xEDa activadas." }, recover: [{ id: "versions", gives: { en: "With versioning on: each object, by deleting its delete marker. The first command lists them.", es: "Con versiones activadas: cada objeto, al borrar su marca de borrado. El primer comando las lista." }, run: ["aws s3api list-object-versions --bucket <bucket> --prefix <key>", "aws s3api delete-object --bucket <bucket> --key <key> --version-id <delete-marker>"], risk: { en: "Deleting a version that is not the marker is permanent.", es: "Borrar una versi\xF3n que no sea la marca es permanente." } }], instead: { note: { en: "Add --dryrun to see the list.", es: "Agrega --dryrun para ver la lista." }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/DeletingObjects.html", checked: "2026-11-25" }, { url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/DeleteMarker.html", checked: "2026-11-25" }, { url: "https://docs.aws.amazon.com/cli/latest/reference/s3/rm.html", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "aws-secret-delete-force", tool: "aws", example: "aws secretsmanager delete-secret --secret-id shop-key --force-delete-without-recovery", title: { en: "Delete a secret right now", es: "Borrar un secreto de inmediato" }, match: [{ run: ["aws", "secretsmanager", "delete-secret"], with: [["--force-delete-without-recovery"]] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "The secret, forever.", es: "El secreto, para siempre." }, recover: [], instead: { note: { en: "Without --force-delete-without-recovery there are at least 7 days to change your mind.", es: "Sin --force-delete-without-recovery hay al menos 7 d\xEDas para arrepentirse." }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://docs.aws.amazon.com/cli/latest/reference/secretsmanager/delete-secret.html", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "aws-secret-delete", tool: "aws", example: "aws secretsmanager delete-secret --secret-id shop-key", title: { en: "Delete a secret", es: "Borrar un secreto" }, match: [{ run: ["aws", "secretsmanager", "delete-secret"], without: [["--force-delete-without-recovery"]] }], verdict: "yes", interrupt: !0, overrides: [], loses: { en: "Access to the secret, right away. Programs that need it stop working.", es: "El acceso al secreto, de inmediato. Los programas que lo necesitan dejan de funcionar." }, recover: [{ id: "restore", gives: { en: "The secret.", es: "El secreto." }, run: ["aws secretsmanager restore-secret --secret-id <secret>"], until: { en: "Until the waiting period ends, from 7 to 30 days.", es: "Hasta que termine el plazo, de 7 a 30 d\xEDas." } }], autocommit: !1, sources: [{ url: "https://docs.aws.amazon.com/cli/latest/reference/secretsmanager/delete-secret.html", checked: "2026-11-25" }, { url: "https://docs.aws.amazon.com/cli/latest/reference/secretsmanager/restore-secret.html", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "az-group-delete", tool: "azure", example: "az group delete --name shop", title: { en: "Delete a resource group in Azure", es: "Borrar un grupo de recursos de Azure" }, match: [{ run: ["az", "group", "delete"] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "The group and everything in it.", es: "El grupo y todo lo que contiene." }, keeps: { en: "Some resources with soft delete, such as key vaults or blobs, if it was set up before.", es: "Algunos recursos con borrado suave, como almacenes de claves o blobs, si ya estaba configurado." }, recover: [], instead: { note: { en: "See what it has: az resource list --resource-group <name>", es: "Mira qu\xE9 contiene: az resource list --resource-group <name>" }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/delete-resource-group", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "cargo-publish", tool: "cargo", example: "cargo publish", title: { en: "Publish a crate", es: "Publicar un crate" }, match: [{ run: ["cargo", "publish"], without: [["-n", "--dry-run"]] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "That version cannot be overwritten, and its code cannot be deleted.", es: "Esa versi\xF3n no se puede sobrescribir, y su c\xF3digo no se puede borrar." }, recover: [], instead: { note: { en: "See what it would do: cargo publish --dry-run. To stop new uses of a version, cargo yank.", es: "Mira qu\xE9 har\xEDa: cargo publish --dry-run. Para frenar nuevos usos de una versi\xF3n, cargo yank." }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://doc.rust-lang.org/cargo/reference/publishing.html", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "cargo-yank", tool: "cargo", example: "cargo yank --version 1.0.0 my-crate", title: { en: "Stop new uses of a crate version", es: "Frenar nuevos usos de una versi\xF3n de un crate" }, match: [{ run: ["cargo", "yank"], without: [["--undo"]] }], verdict: "yes", interrupt: !1, overrides: [], loses: { en: "Nothing. The code stays available for whoever already uses it.", es: "Nada. El c\xF3digo sigue disponible para quien ya lo usa." }, recover: [{ id: "undo", gives: { en: "The version, as before.", es: "La versi\xF3n, como antes." }, run: ["cargo yank --undo --version <version> <crate>"] }], autocommit: !1, sources: [{ url: "https://doc.rust-lang.org/cargo/commands/cargo-yank.html", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "docker-compose-down-volumes", tool: "docker", example: "docker compose down -v", title: { en: "Stop a project and delete its volumes", es: "Detener un proyecto y borrar sus vol\xFAmenes" }, match: [{ run: ["docker", "compose", "down"], with: [["-v", "--volumes"]] }, { run: ["docker-compose", "down"], with: [["-v", "--volumes"]] }, { run: ["podman", "compose", "down"], with: [["-v", "--volumes"]] }], verdict: "no", interrupt: !0, overrides: ["docker-compose-down"], loses: { en: "The volumes of the project, which usually hold its database. Volumes marked as external are kept.", es: "Los vol\xFAmenes del proyecto, donde suele estar su base de datos. Los marcados como externos se conservan." }, recover: [], instead: { note: { en: "Without -v, the volumes stay.", es: "Sin -v, los vol\xFAmenes se quedan." }, run: ["docker compose down"], back: ["docker compose up --detach"] }, autocommit: !1, sources: [{ url: "https://docs.docker.com/reference/cli/docker/compose/down/", checked: "2026-11-25" }], evidence: { kind: "tested", runs: [{ version: "Docker 29.4.2", platform: "linux", date: "2026-11-26" }] } }, { id: "docker-compose-down", tool: "docker", example: "docker compose down", title: { en: "Stop a project and delete its containers", es: "Detener un proyecto y borrar sus contenedores" }, match: [{ run: ["docker", "compose", "down"] }, { run: ["docker-compose", "down"] }, { run: ["podman", "compose", "down"] }], verdict: "partly", interrupt: !1, overrides: [], loses: { en: "What the containers wrote outside their volumes.", es: "Lo que los contenedores escribieron fuera de sus vol\xFAmenes." }, keeps: { en: "The volumes and the images.", es: "Los vol\xFAmenes y las im\xE1genes." }, recover: [{ id: "up", gives: { en: "The project, with the data of its volumes.", es: "El proyecto, con los datos de sus vol\xFAmenes." }, run: ["docker compose up --detach"] }], autocommit: !1, sources: [{ url: "https://docs.docker.com/reference/cli/docker/compose/down/", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "docker-rm", tool: "docker", example: "docker rm -f db", title: { en: "Delete a container", es: "Borrar un contenedor" }, match: [{ run: ["docker", "rm"] }, { run: ["docker", "container", "rm"] }, { run: ["docker", "container", "remove"] }, { run: ["docker", "container", "prune"] }, { run: ["podman", "rm"] }, { run: ["podman", "container", "rm"] }, { run: ["podman", "container", "prune"] }, { run: ["docker", "compose", "rm"] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "What the container wrote outside its volumes. With -v, also its anonymous volumes.", es: "Lo que el contenedor escribi\xF3 fuera de sus vol\xFAmenes. Con -v, tambi\xE9n sus vol\xFAmenes an\xF3nimos." }, recover: [], instead: { note: { en: "Stop it, which keeps everything.", es: "Detenlo, que conserva todo." }, run: ["docker stop <container>"], back: ["docker start <container>"] }, autocommit: !1, sources: [{ url: "https://docs.docker.com/reference/cli/docker/container/rm/", checked: "2026-11-25" }, { url: "https://docs.docker.com/engine/storage/", checked: "2026-11-25" }], evidence: { kind: "tested", runs: [{ version: "Docker 29.4.2", platform: "linux", date: "2026-11-26" }] } }, { id: "docker-rmi", tool: "docker", example: "docker rmi shop:1.0", title: { en: "Delete an image", es: "Borrar una imagen" }, match: [{ run: ["docker", "rmi"] }, { run: ["docker", "image", "rm"] }, { run: ["docker", "image", "remove"] }, { run: ["docker", "image", "prune"] }, { run: ["podman", "rmi"] }, { run: ["podman", "image", "rm"] }, { run: ["podman", "image", "prune"] }], verdict: "partly", interrupt: !1, overrides: [], loses: { en: "Images that were built here and never pushed. They have to be built again.", es: "Las im\xE1genes creadas aqu\xED que nunca se subieron. Hay que volver a crearlas." }, keeps: { en: "The copies in a registry.", es: "Las copias en un registro." }, recover: [{ id: "pull", gives: { en: "The image, if it exists in a registry.", es: "La imagen, si existe en un registro." }, run: ["docker pull <image>"] }], autocommit: !1, sources: [{ url: "https://docs.docker.com/reference/cli/docker/image/rm/", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "docker-system-prune", tool: "docker", example: "docker system prune", title: { en: "Delete what Docker is not using", es: "Borrar lo que Docker no est\xE1 usando" }, match: [{ run: ["docker", "system", "prune"] }, { run: ["podman", "system", "prune"] }], verdict: "partly", interrupt: !0, overrides: [], loses: { en: "Stopped containers, with what they wrote. With --volumes, also unused anonymous volumes.", es: "Los contenedores detenidos, con lo que escribieron. Con --volumes, tambi\xE9n los vol\xFAmenes an\xF3nimos sin usar." }, keeps: { en: "Volumes with a name.", es: "Los vol\xFAmenes con nombre." }, recover: [{ id: "pull", gives: { en: "Images that exist in a registry. The ones built here have to be built again.", es: "Las im\xE1genes que existen en un registro. Las creadas aqu\xED hay que volver a crearlas." }, run: ["docker pull <image>"] }], autocommit: !1, sources: [{ url: "https://docs.docker.com/reference/cli/docker/system/prune/", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "docker-volume-prune", tool: "docker", example: "docker volume prune", title: { en: "Delete the volumes that no container uses", es: "Borrar los vol\xFAmenes que ning\xFAn contenedor usa" }, match: [{ run: ["docker", "volume", "prune"] }, { run: ["podman", "volume", "prune"] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "Unused anonymous volumes. With --all, also the ones with a name, such as the database of a project that is stopped.", es: "Los vol\xFAmenes an\xF3nimos sin usar. Con --all, tambi\xE9n los que tienen nombre, como la base de datos de un proyecto detenido." }, recover: [], instead: { note: { en: "See the list first: docker volume ls --filter dangling=true", es: "Mira antes la lista: docker volume ls --filter dangling=true" }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://docs.docker.com/reference/cli/docker/volume/prune/", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "docker-volume-rm", tool: "docker", example: "docker volume rm shop_data", title: { en: "Delete a volume", es: "Borrar un volumen" }, match: [{ run: ["docker", "volume", "rm"] }, { run: ["docker", "volume", "remove"] }, { run: ["podman", "volume", "rm"] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "Everything in the volume.", es: "Todo lo que hay en el volumen." }, recover: [], before: { note: { en: "Copy what is inside, for example with docker cp from a container that uses it.", es: "Copia lo que contiene, por ejemplo con docker cp desde un contenedor que lo use." }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://docs.docker.com/reference/cli/docker/volume/rm/", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "cp", tool: "files", example: "cp new.txt old.txt", title: { en: "Copy over a file", es: "Copiar encima de un archivo" }, match: [{ run: ["cp"], without: [["-n", "--no-clobber"], ["-i", "--interactive"], ["-b", "--backup"]] }], verdict: "no", interrupt: !1, overrides: [], loses: { en: "What the destination had, if it already existed.", es: "Lo que ten\xEDa el destino, si ya exist\xEDa." }, recover: [], before: { note: { en: "Keep a copy of the destination.", es: "Guarda una copia del destino." }, run: ["cp <file> <copy>"], back: ["cp <copy> <file>"] }, instead: { note: { en: "cp -n never replaces a file.", es: "cp -n nunca reemplaza un archivo." }, run: [], back: [] }, autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "Darwin 25.6.0", platform: "darwin", date: "2026-11-26" }, { version: "GNU coreutils 9.7", platform: "linux", date: "2026-11-26" }, { version: "GNU coreutils 8.32", platform: "win32", date: "2026-11-26" }] } }, { id: "dd", tool: "files", example: "dd if=image.iso of=/dev/sdb", title: { en: "Write over a file or a disk", es: "Escribir encima de un archivo o un disco" }, match: [{ run: ["dd"], operands: { any: ["of=*"], none: ["of=/dev/null", "of=/dev/stdout"] } }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "What was there. With a disk, every partition on it.", es: "Lo que hab\xEDa ah\xED. En un disco, todas sus particiones." }, recover: [], before: { note: { en: "Check the name of the destination twice, and keep a copy of a file.", es: "Revisa dos veces el nombre del destino y guarda una copia si es un archivo." }, run: ["cp <file> <copy>"], back: ["cp <copy> <file>"] }, autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "Darwin 25.6.0", platform: "darwin", date: "2026-11-26" }, { version: "GNU coreutils 9.7", platform: "linux", date: "2026-11-26" }, { version: "GNU coreutils 8.32", platform: "win32", date: "2026-11-26" }] } }, { id: "find-delete", tool: "files", example: 'find . -name "*.log" -delete', title: { en: "Delete everything a search finds", es: "Borrar todo lo que encuentra una b\xFAsqueda" }, match: [{ run: ["find"], with: [["-delete"]] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "The files it finds. They do not go to the trash.", es: "Los archivos que encuentra. No van a la papelera." }, recover: [], instead: { note: { en: "Look at the list first: the same search with -print.", es: "Mira primero la lista: la misma b\xFAsqueda con -print." }, run: ["find . -name <pattern> -print"], back: [] }, autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "Darwin 25.6.0", platform: "darwin", date: "2026-11-26" }, { version: "GNU coreutils 9.7", platform: "linux", date: "2026-11-26" }, { version: "GNU coreutils 8.32", platform: "win32", date: "2026-11-26" }] } }, { id: "mv", tool: "files", example: "mv draft.txt final.txt", title: { en: "Move or rename a file", es: "Mover o renombrar un archivo" }, match: [{ run: ["mv"], without: [["-n", "--no-clobber"], ["-i", "--interactive"], ["-b", "--backup"]] }], verdict: "partly", interrupt: !1, overrides: [], loses: { en: "The file that was already there with the new name, if there was one.", es: "El archivo que ya ten\xEDa el nombre nuevo, si hab\xEDa uno." }, keeps: { en: "The file that you moved.", es: "El archivo que moviste." }, recover: [{ id: "back", gives: { en: "The old name.", es: "El nombre viejo." }, run: ["mv <new> <old>"] }], instead: { note: { en: "mv -n never replaces a file.", es: "mv -n nunca reemplaza un archivo." }, run: [], back: [] }, autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "Darwin 25.6.0", platform: "darwin", date: "2026-11-26" }, { version: "GNU coreutils 9.7", platform: "linux", date: "2026-11-26" }, { version: "GNU coreutils 8.32", platform: "win32", date: "2026-11-26" }] } }, { id: "redirect", tool: "files", example: "echo hello > notes.txt", title: { en: "Write over a file with >", es: "Escribir encima de un archivo con >" }, match: [{ redirect: "overwrite" }], verdict: "no", interrupt: !1, overrides: [], loses: { en: "What the file had, if it already existed, even when the command fails.", es: "Lo que ten\xEDa el archivo, si ya exist\xEDa, incluso si el comando falla." }, recover: [], before: { note: { en: "Keep a copy.", es: "Guarda una copia." }, run: ["cp <file> <copy>"], back: ["cp <copy> <file>"] }, instead: { note: { en: ">> adds to the end and deletes nothing.", es: ">> agrega al final y no borra nada." }, run: [], back: [] }, autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "Darwin 25.6.0", platform: "darwin", date: "2026-11-26" }, { version: "GNU coreutils 9.7", platform: "linux", date: "2026-11-26" }, { version: "GNU coreutils 8.32", platform: "win32", date: "2026-11-26" }] } }, { id: "rm-build-output", tool: "files", example: "rm -rf dist", title: { en: "Delete the result of a build", es: "Borrar el resultado de una compilaci\xF3n" }, match: [{ run: ["rm"], operands: { every: ["dist", "*/dist", "dist/*", "build", "*/build", "build/*", "out", "*/out", "out/*", "target", "*/target", "target/*", "coverage", "*/coverage", "coverage/*", ".next", "*/.next", ".next/*", ".nuxt", "*/.nuxt", ".turbo", "*/.turbo", ".svelte-kit", "*/.svelte-kit", ".parcel-cache", "*/.parcel-cache"], none: ["/*", "~*", "*..*", "*:*"] } }, { run: ["rimraf"], operands: { every: ["dist", "*/dist", "dist/*", "build", "*/build", "build/*", "out", "*/out", "out/*", "target", "*/target", "target/*", "coverage", "*/coverage", "coverage/*", ".next", "*/.next", ".next/*", ".nuxt", "*/.nuxt", ".turbo", "*/.turbo", ".svelte-kit", "*/.svelte-kit", ".parcel-cache", "*/.parcel-cache"], none: ["/*", "~*", "*..*", "*:*"] } }, { run: ["del-cli"], operands: { every: ["dist", "*/dist", "dist/*", "build", "*/build", "build/*", "out", "*/out", "out/*", "target", "*/target", "target/*", "coverage", "*/coverage", "coverage/*", ".next", "*/.next", ".next/*", ".nuxt", "*/.nuxt", ".turbo", "*/.turbo", ".svelte-kit", "*/.svelte-kit", ".parcel-cache", "*/.parcel-cache"], none: ["/*", "~*", "*..*", "*:*"] } }, { run: ["remove-item"], operands: { every: ["dist", "*/dist", "dist/*", "build", "*/build", "build/*", "out", "*/out", "out/*", "target", "*/target", "target/*", "coverage", "*/coverage", "coverage/*", ".next", "*/.next", ".next/*", ".nuxt", "*/.nuxt", ".turbo", "*/.turbo", ".svelte-kit", "*/.svelte-kit", ".parcel-cache", "*/.parcel-cache"], none: ["/*", "~*", "*..*", "*:*"] } }], verdict: "partly", interrupt: !1, overrides: ["rm", "remove-item"], loses: { en: "Anything in there that was put by hand.", es: "Lo que alguien haya puesto ah\xED a mano." }, keeps: { en: "What the build makes.", es: "Lo que genera la compilaci\xF3n." }, recover: [{ id: "build", gives: { en: "The result of the build. Use the command of your project.", es: "El resultado de la compilaci\xF3n. Usa el comando de tu proyecto." }, run: ["npm run build"] }], autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "npm 11.19.1", platform: "darwin", date: "2026-11-26" }, { version: "npm 11.19.1", platform: "linux", date: "2026-11-26" }, { version: "npm 11.19.1", platform: "win32", date: "2026-11-26" }] } }, { id: "rm-git", tool: "files", example: "rm -rf .git", title: { en: "Delete a git repository", es: "Borrar un repositorio de git" }, match: [{ run: ["rm"], operands: { any: [".git", "*/.git"] } }, { run: ["remove-item"], operands: { any: [".git", "*/.git"] } }], verdict: "no", interrupt: !0, overrides: ["rm", "remove-item"], loses: { en: "The whole history, the branches and the stashes that were not on a server.", es: "Todo el historial, las ramas y los stash que no estaban en un servidor." }, recover: [], instead: { note: { en: "Move it out of the way.", es: "Qu\xEDtalo de en medio sin borrarlo." }, run: ["mv .git <elsewhere>"], back: ["mv <elsewhere> .git"] }, autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "rm-pycache", tool: "files", example: "rm -rf __pycache__", title: { en: "Delete Python's compiled files", es: "Borrar los archivos compilados de Python" }, match: [{ run: ["rm"], operands: { every: ["__pycache__", "*/__pycache__", "*.pyc", ".pytest_cache", "*/.pytest_cache", ".mypy_cache", "*/.mypy_cache", ".ruff_cache", "*/.ruff_cache"] } }], verdict: "yes", interrupt: !1, overrides: ["rm"], loses: { en: "Nothing. Python writes them again.", es: "Nada. Python los vuelve a escribir." }, recover: [{ id: "automatic", gives: { en: "They come back on their own the next time the program runs.", es: "Vuelven solos la pr\xF3xima vez que se ejecute el programa." }, run: [] }], autocommit: !1, sources: [{ url: "https://docs.python.org/3/tutorial/modules.html#compiled-python-files", checked: "2026-11-25" }, { url: "https://docs.pytest.org/en/stable/how-to/cache.html", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "rm-temporary", tool: "files", example: "rm -rf /tmp/build-1234", title: { en: "Delete temporary files", es: "Borrar archivos temporales" }, match: [{ run: ["rm"], operands: { every: ["/tmp/*", "/var/tmp/*", "*/AppData/Local/Temp/*"], none: ["*..*"] } }], verdict: "no", interrupt: !1, overrides: ["rm"], loses: { en: "The temporary files.", es: "Los archivos temporales." }, recover: [], autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "Darwin 25.6.0", platform: "darwin", date: "2026-11-26" }, { version: "GNU coreutils 9.7", platform: "linux", date: "2026-11-26" }, { version: "GNU coreutils 8.32", platform: "win32", date: "2026-11-26" }] } }, { id: "rm", tool: "files", example: "rm -rf folder", title: { en: "Delete files", es: "Borrar archivos" }, match: [{ run: ["rm"] }, { run: ["unlink"] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "The files. They do not go to the trash.", es: "Los archivos. No van a la papelera." }, recover: [], instead: { note: { en: "Move it somewhere else, and delete it when you are sure. In a git repository, what was committed comes back with git restore.", es: "Mu\xE9velo a otro lugar y b\xF3rralo cuando est\xE9s seguro. En un repositorio de git, lo confirmado vuelve con git restore." }, run: ["mv <path> <elsewhere>"], back: ["mv <elsewhere> <path>"] }, autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "Darwin 25.6.0", platform: "darwin", date: "2026-11-26" }, { version: "GNU coreutils 9.7", platform: "linux", date: "2026-11-26" }, { version: "GNU coreutils 8.32", platform: "win32", date: "2026-11-26" }] } }, { id: "rsync-delete", tool: "files", example: "rsync -a --delete source/ backup/", title: { en: "Copy a folder and delete what is extra", es: "Copiar una carpeta y borrar lo que sobra" }, match: [{ run: ["rsync"], with: [["--delete", "--del", "--delete-before", "--delete-during", "--delete-delay", "--delete-after", "--delete-excluded"]], without: [["-n", "--dry-run"], ["--backup-dir"]] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "The files in the destination that are not in the source, and the old version of the ones that changed.", es: "Los archivos del destino que no est\xE1n en el origen, y la versi\xF3n vieja de los que cambiaron." }, recover: [], before: { note: { en: "Add --dry-run to see the list, or --backup --backup-dir to keep what it would delete.", es: "Agrega --dry-run para ver la lista, o --backup --backup-dir para conservar lo que borrar\xEDa." }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://download.samba.org/pub/rsync/rsync.1", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "sed-in-place", tool: "files", example: 'sed -i "s/old/new/g" config.txt', title: { en: "Edit files in place", es: "Editar archivos directamente" }, match: [{ run: ["sed"], with: [["-i", "--in-place"]], without: [["-i.bak", "-i.orig", "-i.old", "-i~", "--in-place=.bak", "--in-place=.orig"]] }, { run: ["gsed"], with: [["-i", "--in-place"]], without: [["-i.bak", "-i.orig", "-i.old", "-i~", "--in-place=.bak", "--in-place=.orig"]] }, { run: ["perl"], with: [["-i"]], without: [["-i.bak", "-i.orig"]] }], verdict: "no", interrupt: !1, overrides: [], loses: { en: "The text that was replaced. Running the opposite also changes what was already like that.", es: "El texto reemplazado. Hacer lo contrario tambi\xE9n cambia lo que ya estaba as\xED." }, recover: [], instead: { note: { en: "Ask sed to keep a copy.", es: "Pide a sed que guarde una copia." }, run: ["sed -i.bak <change> <file>"], back: ["mv <file>.bak <file>"] }, autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "Darwin 25.6.0", platform: "darwin", date: "2026-11-26" }, { version: "GNU coreutils 9.7", platform: "linux", date: "2026-11-26" }, { version: "GNU coreutils 8.32", platform: "win32", date: "2026-11-26" }] } }, { id: "shred", tool: "files", example: "shred -u secret.txt", title: { en: "Destroy a file on purpose", es: "Destruir un archivo a prop\xF3sito" }, match: [{ run: ["shred"] }, { run: ["gshred"] }, { run: ["srm"] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "The file. It is overwritten so that nobody can recover it.", es: "El archivo. Se sobrescribe para que nadie lo recupere." }, recover: [], autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "GNU coreutils 9.7", platform: "linux", date: "2026-11-26" }, { version: "GNU coreutils 8.32", platform: "win32", date: "2026-11-26" }] } }, { id: "truncate", tool: "files", example: "truncate -s 0 app.log", title: { en: "Empty a file", es: "Vaciar un archivo" }, match: [{ run: ["truncate"] }, { run: ["gtruncate"] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "What the file had.", es: "Lo que ten\xEDa el archivo." }, recover: [], before: { note: { en: "Keep a copy.", es: "Guarda una copia." }, run: ["cp <file> <copy>"], back: ["cp <copy> <file>"] }, autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "GNU coreutils 9.7", platform: "linux", date: "2026-11-26" }, { version: "GNU coreutils 8.32", platform: "win32", date: "2026-11-26" }] } }, { id: "fly-volume-destroy", tool: "fly", example: "fly volumes destroy vol_123", title: { en: "Delete a Fly.io volume", es: "Borrar un volumen de Fly.io" }, match: [{ run: ["fly", "volumes", "destroy"] }, { run: ["flyctl", "volumes", "destroy"] }, { run: ["fly", "volume", "destroy"] }, { run: ["fly", "vol", "destroy"] }], verdict: "partly", interrupt: !0, overrides: [], loses: { en: "The data since the last snapshot.", es: "Los datos desde la \xFAltima instant\xE1nea." }, recover: [{ id: "snapshot", gives: { en: "A new volume with the last snapshot. It needs the ID of the deleted one, which can be listed for 24 hours.", es: "Un volumen nuevo con la \xFAltima instant\xE1nea. Necesita el ID del borrado, que se puede consultar durante 24 horas." }, run: ["fly volumes list --all", "fly volumes snapshots list <volume>", "fly volumes create <name> --snapshot-id <snapshot> -s <size>"], until: { en: "5 days by default.", es: "5 d\xEDas por defecto." } }], autocommit: !1, sources: [{ url: "https://docs.fly.io/volumes/snapshots", checked: "2026-11-25" }, { url: "https://docs.fly.io/flyctl/cmd/fly_volumes_destroy", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "gcloud-project-delete", tool: "gcloud", example: "gcloud projects delete my-shop", title: { en: "Delete a Google Cloud project", es: "Borrar un proyecto de Google Cloud" }, match: [{ run: ["gcloud", "projects", "delete"] }], verdict: "partly", interrupt: !0, overrides: [], loses: { en: "Some data may go before the 30 days, such as Cloud Storage buckets without soft delete. Billing has to be turned on again.", es: "Algunos datos pueden irse antes de los 30 d\xEDas, como los buckets sin borrado suave. Hay que volver a activar la facturaci\xF3n." }, recover: [{ id: "undelete", gives: { en: "The project.", es: "El proyecto." }, run: ["gcloud projects undelete <project>"], until: { en: "30 days.", es: "30 d\xEDas." } }], autocommit: !1, sources: [{ url: "https://docs.cloud.google.com/resource-manager/docs/delete-restore-projects", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "gcloud-sql-delete", tool: "gcloud", example: "gcloud sql instances delete shop", title: { en: "Delete a Cloud SQL server", es: "Borrar un servidor de Cloud SQL" }, match: [{ run: ["gcloud", "sql", "instances", "delete"] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "All the data and its backups, also the ones made on demand.", es: "Todos los datos y sus copias, tambi\xE9n las hechas a petici\xF3n." }, keeps: { en: "A final backup, only if you ask for one. Otherwise, Google may be able to help within 4 days.", es: "Una copia final, solo si la pides. Si no, Google quiz\xE1 pueda ayudar en los primeros 4 d\xEDas." }, recover: [], instead: { note: { en: "Add --enable-final-backup, so that a last copy stays.", es: "Agrega --enable-final-backup, para que quede una \xFAltima copia." }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://docs.cloud.google.com/sql/docs/mysql/delete-instance", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "git-abort", tool: "git", example: "git merge --abort", title: { en: "Give up a merge or a rebase halfway", es: "Abandonar un merge o un rebase a medias" }, match: [{ run: ["git", "merge"], with: [["--abort"]] }, { run: ["git", "rebase"], with: [["--abort"]] }, { run: ["git", "cherry-pick"], with: [["--abort"]] }, { run: ["git", "revert"], with: [["--abort"]] }, { run: ["git", "am"], with: [["--abort"]] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "The conflicts that you had already resolved.", es: "Los conflictos que ya hab\xEDas resuelto." }, recover: [], before: { note: { en: "Copy the files that you resolved outside the repository.", es: "Copia fuera del repositorio los archivos que resolviste." }, run: ["cp <file> <copy>"], back: ["cp <copy> <file>"] }, autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "git-branch-delete", tool: "git", example: "git branch -D feature", title: { en: "Delete a branch", es: "Borrar una rama" }, match: [{ run: ["git", "branch"], with: [["-D", "-d", "--delete"]] }], verdict: "yes", interrupt: !1, overrides: [], loses: { en: "The name of the branch and its settings. The commits stay.", es: "El nombre de la rama y su configuraci\xF3n. Los commits quedan." }, recover: [{ id: "recreate", gives: { en: "The branch. Git prints its commit when it deletes it, and the first command also lists it.", es: "La rama. Git muestra su commit al borrarla, y el primer comando tambi\xE9n lo lista." }, run: ["git reflog", "git branch <name> <commit>"], until: { en: "30 days by default, if you had that branch checked out in this copy.", es: "30 d\xEDas por defecto, si tuviste esa rama activa en esta copia." } }], autocommit: !1, sources: [{ url: "https://git-scm.com/docs/git-gc", checked: "2026-11-25" }], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "git-branch-force", tool: "git", example: "git branch -f feature main", title: { en: "Move a branch to another commit", es: "Mover una rama a otro commit" }, match: [{ run: ["git", "branch"], with: [["-f", "--force"]], without: [["-D", "-d", "--delete"]] }], verdict: "yes", interrupt: !1, overrides: [], loses: { en: "The branch stops pointing to its commits. They stay.", es: "La rama deja de apuntar a sus commits, que siguen ah\xED." }, recover: [{ id: "previous", gives: { en: "The position the branch had.", es: "La posici\xF3n que ten\xEDa la rama." }, run: ["git branch --force <name> <name>@{1}"], until: { en: "30 days by default. The 1 means one move ago.", es: "30 d\xEDas por defecto. El 1 significa un movimiento atr\xE1s." } }], autocommit: !1, sources: [{ url: "https://git-scm.com/docs/git-gc", checked: "2026-11-25" }], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "git-checkout-files", tool: "git", example: "git checkout -- src/app.js", title: { en: "Replace files with an older version", es: "Reemplazar archivos con una versi\xF3n anterior" }, match: [{ run: ["git", "checkout"], without: [["-b"], ["-B"]], operands: { afterDashes: !0 } }, { run: ["git", "checkout"], without: [["-b"], ["-B"]], operands: { any: [".", "./*", "../*", ":/", "*.js", "*.ts", "*.jsx", "*.tsx", "*.mjs", "*.cjs", "*.py", "*.go", "*.rs", "*.java", "*.kt", "*.swift", "*.c", "*.h", "*.cc", "*.cpp", "*.hpp", "*.cs", "*.rb", "*.php", "*.vue", "*.svelte", "*.html", "*.css", "*.scss", "*.json", "*.yml", "*.yaml", "*.toml", "*.xml", "*.md", "*.txt", "*.sh", "*.ps1", "*.sql", "*.lock", "*.env", "*/Makefile", "Makefile", "Dockerfile"] } }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "The changes in those files that were not staged or committed.", es: "Los cambios de esos archivos que no se prepararon ni se confirmaron." }, recover: [], instead: { note: { en: "Put them away instead of discarding them.", es: "Gu\xE1rdalos en lugar de descartarlos." }, run: ["git stash push -- <file>"], back: ["git stash pop"] }, autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "git-checkout-force", tool: "git", example: "git checkout -f main", title: { en: "Change branch and discard changes", es: "Cambiar de rama y descartar cambios" }, match: [{ run: ["git", "checkout"], with: [["-f", "--force"]] }, { run: ["git", "switch"], with: [["-f", "--force", "--discard-changes"]] }], verdict: "no", interrupt: !0, overrides: ["git-checkout-files"], loses: { en: "Every change that was not committed.", es: "Todos los cambios sin confirmar." }, recover: [], instead: { note: { en: "Put the changes away, then change branch. The way back needs both steps.", es: "Guarda los cambios y despu\xE9s cambia de rama. Para volver hacen falta los dos pasos." }, run: ["git stash push --include-untracked", "git switch <branch>"], back: ["git switch -", "git stash pop"] }, autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "git-cherry-pick", tool: "git", example: "git cherry-pick a1b2c3d", title: { en: "Copy a commit from another branch", es: "Copiar un commit de otra rama" }, match: [{ run: ["git", "cherry-pick"], without: [["--abort"], ["--continue"], ["--quit"], ["--skip"], ["-n", "--no-commit"]] }], verdict: "yes", interrupt: !1, overrides: [], loses: { en: "Nothing.", es: "Nada." }, recover: [{ id: "undo", gives: { en: "The branch without the copied commit. Repeat it once for each commit you copied.", es: "La rama sin el commit copiado. Rep\xEDtelo una vez por cada commit que copiaste." }, run: ["git reset --keep HEAD~1"], until: { en: "Right after, and before you push it.", es: "Justo despu\xE9s, y antes de subirlo." } }], autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "git-clean", tool: "git", example: "git clean -fd", title: { en: "Delete files that git does not track", es: "Borrar archivos que git no sigue" }, match: [{ run: ["git", "clean"], with: [["-f", "--force"]], without: [["-n", "--dry-run"]] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "The files git does not track. With -x, also the ignored ones, such as .env.", es: "Los archivos que git no sigue. Con -x, tambi\xE9n los ignorados, como .env." }, recover: [], instead: { note: { en: "Put them away instead. Add --all if you were going to use -x.", es: "Gu\xE1rdalos en su lugar. Agrega --all si ibas a usar -x." }, run: ["git stash push --include-untracked"], back: ["git stash pop"] }, autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "git-commit-amend", tool: "git", example: "git commit --amend", title: { en: "Replace the last commit", es: "Reemplazar el \xFAltimo commit" }, match: [{ run: ["git", "commit"], with: [["--amend"]], without: [["--dry-run"]] }], verdict: "yes", interrupt: !1, overrides: [], loses: { en: "Nothing. The old commit stays outside the branch.", es: "Nada. El commit viejo queda fuera de la rama." }, recover: [{ id: "previous", gives: { en: "The commit as it was. What you added stays staged.", es: "El commit como estaba. Lo que agregaste queda preparado." }, run: ["git reset --soft HEAD@{1}"], until: { en: "30 days by default. The 1 means one move ago, so check git reflog if you did something else after.", es: "30 d\xEDas por defecto. El 1 significa un movimiento atr\xE1s, as\xED que mira git reflog si hiciste algo m\xE1s despu\xE9s." } }], autocommit: !1, sources: [{ url: "https://git-scm.com/docs/git-gc", checked: "2026-11-25" }], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "git-commit", tool: "git", example: 'git commit -m "message"', title: { en: "Save a commit", es: "Guardar un commit" }, match: [{ run: ["git", "commit"], without: [["--amend"], ["--dry-run"]] }], verdict: "yes", interrupt: !1, overrides: [], loses: { en: "Nothing.", es: "Nada." }, recover: [{ id: "undo", gives: { en: "The changes, staged as they were before the commit.", es: "Los cambios, preparados como estaban antes del commit." }, run: ["git reset --soft HEAD~1"], until: { en: "Before you push it. After that, use git revert.", es: "Antes de subirlo. Despu\xE9s, usa git revert." } }], autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "git-filter-branch", tool: "git", example: 'git filter-branch --tree-filter "rm -f secret.txt" HEAD', title: { en: "Rewrite all the history", es: "Reescribir todo el historial" }, match: [{ run: ["git", "filter-branch"] }], verdict: "yes", interrupt: !0, overrides: [], loses: { en: "Nothing yet. Git keeps the old history under refs/original.", es: "Nada todav\xEDa. Git conserva el historial viejo en refs/original." }, recover: [{ id: "original", gives: { en: "The branch with its old history.", es: "La rama con su historial viejo." }, run: ["git reset --keep refs/original/refs/heads/<branch>"], until: { en: "Until refs/original is deleted or another filter-branch replaces it.", es: "Hasta que se borre refs/original o lo reemplace otro filter-branch." } }], autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "git-filter-repo", tool: "git", example: "git filter-repo --path secret.txt --invert-paths", title: { en: "Rewrite all the history with filter-repo", es: "Reescribir todo el historial con filter-repo" }, match: [{ run: ["git", "filter-repo"], without: [["--analyze"], ["--dry-run"], ["-n"]] }, { run: ["git-filter-repo"], without: [["--analyze"], ["--dry-run"], ["-n"]] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "The old history. It deletes the old commits and the reflog as soon as it finishes.", es: "El historial viejo. Borra los commits viejos y el reflog en cuanto termina." }, recover: [], before: { note: { en: "Work on a fresh clone and keep the original until you have checked the result.", es: "Trabaja en un clon nuevo y conserva el original hasta revisar el resultado." }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://raw.githubusercontent.com/newren/git-filter-repo/main/Documentation/git-filter-repo.txt", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "git-merge", tool: "git", example: "git merge feature", title: { en: "Join another branch", es: "Unir otra rama" }, match: [{ run: ["git", "merge"], without: [["--abort"], ["--continue"], ["--quit"]] }], verdict: "yes", interrupt: !1, overrides: [], loses: { en: "Nothing.", es: "Nada." }, recover: [{ id: "previous", gives: { en: "The branch as it was before the merge.", es: "La rama como estaba antes del merge." }, run: ["git reset --keep ORIG_HEAD"], until: { en: "Until another reset, merge or rebase, and before you push it.", es: "Hasta otro reset, merge o rebase, y antes de subirlo." } }], autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "git-prune", tool: "git", example: "git gc --prune=now", title: { en: "Clean up what git was keeping", es: "Limpiar lo que git conservaba" }, match: [{ run: ["git", "gc"], with: [["--prune=now", "--prune=all"]] }, { run: ["git", "prune"], without: [["-n", "--dry-run"]] }, { run: ["git", "reflog", "expire"], without: [["-n", "--dry-run"]] }, { run: ["git", "reflog", "delete"], without: [["-n", "--dry-run"]] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "Deleted commits, branches and stashes. The recipes that bring them back stop working.", es: "Commits, ramas y stash borrados. Las recetas para recuperarlos dejan de servir." }, recover: [], instead: { note: { en: "git gc on its own keeps the last 2 weeks.", es: "git gc, sin m\xE1s, conserva las \xFAltimas 2 semanas." }, run: ["git gc"], back: [] }, autocommit: !1, sources: [{ url: "https://git-scm.com/docs/git-gc", checked: "2026-11-25" }], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "git-push-delete", tool: "git", example: "git push origin --delete feature", title: { en: "Delete a branch on the server", es: "Borrar una rama en el servidor" }, match: [{ run: ["git", "push"], with: [["-d", "--delete"]] }, { run: ["git", "push"], operands: { any: [":*"] } }, { run: ["git", "push"], with: [["--prune"]] }], verdict: "partly", interrupt: !0, overrides: [], loses: { en: "The commits on that branch that you never downloaded.", es: "Los commits de esa rama que nunca descargaste." }, keeps: { en: "The commits that you have in this copy.", es: "Los commits que tienes en esta copia." }, recover: [{ id: "push", gives: { en: "The branch, from the last commit of it that you have. Look for it in git reflog or in your local branch.", es: "La rama, desde el \xFAltimo commit que tengas de ella. B\xFAscalo en git reflog o en tu rama local." }, run: ["git push origin <commit>:refs/heads/<branch>"] }], autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "git-push-force", tool: "git", example: "git push --force", title: { en: "Replace a branch on the server", es: "Reemplazar una rama en el servidor" }, match: [{ run: ["git", "push"], with: [["-f", "--force"]] }, { run: ["git", "push"], operands: { any: ["+*"] } }, { run: ["git", "push"], with: [["--mirror"]] }], verdict: "partly", interrupt: !0, overrides: [], loses: { en: "The commits on the server that you never downloaded, such as someone else's.", es: "Los commits del servidor que nunca descargaste, como los de otra persona." }, keeps: { en: "The commits that you had downloaded.", es: "Los commits que ya hab\xEDas descargado." }, recover: [{ id: "previous", gives: { en: "The branch as it was on the server the last time you downloaded it.", es: "La rama tal como estaba en el servidor la \xFAltima vez que la descargaste." }, run: ["git reflog show origin/<branch>", "git push --force-with-lease origin origin/<branch>@{1}:refs/heads/<branch>"], until: { en: "30 days by default, in this copy. The 1 means one move ago.", es: "30 d\xEDas por defecto, en esta copia. El 1 significa un movimiento atr\xE1s." } }], instead: { note: { en: "git push --force-with-lease refuses when the server has commits you have not seen.", es: "git push --force-with-lease se niega si el servidor tiene commits que no has visto." }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://git-scm.com/docs/git-gc", checked: "2026-11-25" }], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "git-push-lease", tool: "git", example: "git push --force-with-lease", title: { en: "Replace a branch on the server, if nobody else changed it", es: "Reemplazar una rama en el servidor, si nadie m\xE1s la cambi\xF3" }, match: [{ run: ["git", "push"], with: [["--force-with-lease"]], without: [["-f", "--force"]] }], verdict: "yes", interrupt: !1, overrides: [], loses: { en: "The old commits leave the branch. You have them, because git checks that you had seen them.", es: "Los commits viejos salen de la rama. T\xFA los tienes, porque git comprueba que los hab\xEDas visto." }, recover: [{ id: "previous", gives: { en: "The branch as it was on the server.", es: "La rama tal como estaba en el servidor." }, run: ["git push --force-with-lease origin origin/<branch>@{1}:refs/heads/<branch>"], until: { en: "30 days by default, in this copy. The 1 means one move ago.", es: "30 d\xEDas por defecto, en esta copia. El 1 significa un movimiento atr\xE1s." } }], autocommit: !1, sources: [{ url: "https://git-scm.com/docs/git-gc", checked: "2026-11-25" }], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "git-rebase", tool: "git", example: "git rebase main", title: { en: "Rewrite the commits of a branch", es: "Reescribir los commits de una rama" }, match: [{ run: ["git", "rebase"], without: [["--abort"], ["--continue"], ["--skip"], ["--quit"], ["--edit-todo"], ["--show-current-patch"]] }], verdict: "yes", interrupt: !1, overrides: [], loses: { en: "Nothing. The old commits stay outside the branch.", es: "Nada. Los commits viejos quedan fuera de la rama." }, recover: [{ id: "previous", gives: { en: "The branch as it was before the rebase.", es: "La rama como estaba antes del rebase." }, run: ["git reset --keep <branch>@{1}"], until: { en: "30 days by default. The 1 means one move ago.", es: "30 d\xEDas por defecto. El 1 significa un movimiento atr\xE1s." } }], autocommit: !1, sources: [{ url: "https://git-scm.com/docs/git-gc", checked: "2026-11-25" }], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "git-reset-hard", tool: "git", example: "git reset --hard HEAD~1", title: { en: "Move a branch and discard changes", es: "Mover una rama y descartar cambios" }, match: [{ run: ["git", "reset"], with: [["--hard"]] }], verdict: "partly", interrupt: !0, overrides: [], loses: { en: "Changes that were never committed or staged, in every file git tracks.", es: "Los cambios que nunca se confirmaron ni se prepararon, en todos los archivos que git sigue." }, keeps: { en: "The commits. Git remembers where the branch was.", es: "Los commits. Git recuerda d\xF3nde estaba la rama." }, recover: [{ id: "commits", gives: { en: "The commits that the branch lost.", es: "Los commits que perdi\xF3 la rama." }, run: ["git reset --keep ORIG_HEAD"], until: { en: "Works until another reset, merge or rebase. After that, the commit is still in git reflog, for 30 days by default.", es: "Sirve hasta otro reset, merge o rebase. Despu\xE9s, el commit sigue en git reflog, 30 d\xEDas por defecto." } }, { id: "staged", gives: { en: "Files that were staged with git add. The first command leaves them in that folder with other names.", es: "Archivos preparados con git add. El primer comando los deja en esa carpeta con otros nombres." }, run: ["git fsck --lost-found", "cp .git/lost-found/other/<hash> <file>"], until: { en: "Until git cleans up, 2 weeks by default.", es: "Hasta que git haga limpieza, 2 semanas por defecto." } }], before: { note: { en: "Put the changes away first.", es: "Guarda antes los cambios." }, run: ["git stash push --include-untracked"], back: ["git stash pop"] }, autocommit: !1, sources: [{ url: "https://git-scm.com/docs/git-gc", checked: "2026-11-25" }], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "git-restore", tool: "git", example: "git restore src/app.js", title: { en: "Discard changes in files", es: "Descartar cambios en archivos" }, match: [{ run: ["git", "restore"], without: [["-S", "--staged"]] }, { run: ["git", "restore"], with: [["-W", "--worktree"]] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "The changes in those files that were not staged or committed.", es: "Los cambios de esos archivos que no se prepararon ni se confirmaron." }, recover: [], instead: { note: { en: "Put them away instead of discarding them.", es: "Gu\xE1rdalos en lugar de descartarlos." }, run: ["git stash push -- <file>"], back: ["git stash pop"] }, autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "git-rm-force", tool: "git", example: "git rm -f old.txt", title: { en: "Delete a file even if it has changes", es: "Borrar un archivo aunque tenga cambios" }, match: [{ run: ["git", "rm"], with: [["-f", "--force"]], without: [["--cached"], ["-n", "--dry-run"]] }], verdict: "partly", interrupt: !0, overrides: [], loses: { en: "The changes in the file that were not committed.", es: "Los cambios del archivo que no se confirmaron." }, keeps: { en: "The file as it was in the last commit.", es: "El archivo como estaba en el \xFAltimo commit." }, recover: [{ id: "restore", gives: { en: "The file, as in the last commit.", es: "El archivo, como en el \xFAltimo commit." }, run: ["git restore --staged --worktree -- <file>"], risk: { en: "Replaces a new file with the same name.", es: "Reemplaza un archivo nuevo con el mismo nombre." } }], instead: { note: { en: "Without -f, git refuses when something would be lost.", es: "Sin -f, git se niega cuando se perder\xEDa algo." }, run: [], back: [] }, autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "git-rm", tool: "git", example: "git rm old.txt", title: { en: "Delete a file and stage its deletion", es: "Borrar un archivo y preparar su borrado" }, match: [{ run: ["git", "rm"], without: [["-f", "--force"], ["--cached"], ["-n", "--dry-run"]] }], verdict: "yes", interrupt: !1, overrides: [], loses: { en: "Nothing. Git refuses when the file has changes that were not committed.", es: "Nada. Git se niega si el archivo tiene cambios sin confirmar." }, recover: [{ id: "restore", gives: { en: "The file, as in the last commit.", es: "El archivo, como en el \xFAltimo commit." }, run: ["git restore --staged --worktree -- <file>"], risk: { en: "Replaces a new file with the same name.", es: "Reemplaza un archivo nuevo con el mismo nombre." } }], autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "git-stash-clear", tool: "git", example: "git stash clear", title: { en: "Delete every stash", es: "Borrar todos los stash" }, match: [{ run: ["git", "stash", "clear"] }], verdict: "yes", interrupt: !0, overrides: [], loses: { en: "The list of stashes. Git keeps them for a while, but without names or order.", es: "La lista de stash. Git los conserva un tiempo, pero sin nombre ni orden." }, recover: [{ id: "apply", gives: { en: 'Each stash, one at a time. They are commits in the first list, and their message usually starts with "WIP on".', es: "Cada stash, uno por uno. Son commits de la primera lista, y su mensaje suele empezar por \xABWIP on\xBB." }, run: ["git fsck --unreachable --no-reflogs", "git stash store <hash>"], until: { en: "Until git cleans up, 2 weeks by default.", es: "Hasta que git haga limpieza, 2 semanas por defecto." } }], autocommit: !1, sources: [{ url: "https://git-scm.com/docs/git-gc", checked: "2026-11-25" }], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "git-stash-drop", tool: "git", example: "git stash drop", title: { en: "Delete a stash", es: "Borrar un stash" }, match: [{ run: ["git", "stash", "drop"] }], verdict: "yes", interrupt: !1, overrides: [], loses: { en: "The stash leaves the list, but git keeps it for a while.", es: "El stash sale de la lista, pero git lo conserva un tiempo." }, recover: [{ id: "apply", gives: { en: 'The stash. Git prints its hash when it drops it. Otherwise, it is one of the commits in the first list, and its message usually starts with "WIP on".', es: "El stash. Git muestra su hash al borrarlo. Si no, es uno de los commits de la primera lista, y su mensaje suele empezar por \xABWIP on\xBB." }, run: ["git fsck --unreachable --no-reflogs", "git stash apply <hash>"], until: { en: "Until git cleans up, 2 weeks by default.", es: "Hasta que git haga limpieza, 2 semanas por defecto." } }], autocommit: !1, sources: [{ url: "https://git-scm.com/docs/git-gc", checked: "2026-11-25" }], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "git-tag-delete", tool: "git", example: "git tag -d v1.0", title: { en: "Delete a tag", es: "Borrar una etiqueta" }, match: [{ run: ["git", "tag"], with: [["-d", "--delete"]] }], verdict: "yes", interrupt: !1, overrides: [], loses: { en: "The name. The commit stays, and so does the text of an annotated tag.", es: "El nombre. El commit queda, y tambi\xE9n el texto de una etiqueta anotada." }, recover: [{ id: "annotated", gives: { en: "An annotated tag, with its message. Git prints the hash when it deletes it, and the first command also lists it.", es: "Una etiqueta anotada, con su mensaje. Git muestra el hash al borrarla, y el primer comando tambi\xE9n lo lista." }, run: ["git fsck --no-reflogs", "git tag <name> <hash>"], until: { en: "Until git cleans up, 2 weeks by default.", es: "Hasta que git haga limpieza, 2 semanas por defecto." } }, { id: "lightweight", gives: { en: "A simple tag, which is only a name for a commit.", es: "Una etiqueta simple, que solo es un nombre para un commit." }, run: ["git tag <name> <commit>"] }], autocommit: !1, sources: [{ url: "https://git-scm.com/docs/git-gc", checked: "2026-11-25" }], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "git-unstage", tool: "git", example: "git restore --staged src/app.js", title: { en: "Take files out of the next commit", es: "Sacar archivos del pr\xF3ximo commit" }, match: [{ run: ["git", "restore"], with: [["-S", "--staged"]], without: [["-W", "--worktree"]] }, { run: ["git", "reset"], without: [["--hard"], ["--soft"], ["--keep"], ["--merge"]], operands: { afterDashes: !0 } }], verdict: "partly", interrupt: !1, overrides: [], loses: { en: "The staged version, if you edited the file after staging it.", es: "La versi\xF3n preparada, si editaste el archivo despu\xE9s de prepararla." }, keeps: { en: "The file in your folder.", es: "El archivo en tu carpeta." }, recover: [{ id: "add", gives: { en: "The file in the next commit, as it is now.", es: "El archivo en el pr\xF3ximo commit, como est\xE1 ahora." }, run: ["git add <file>"] }], autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "git-worktree-remove", tool: "git", example: "git worktree remove ../feature", title: { en: "Delete a worktree", es: "Borrar un worktree" }, match: [{ run: ["git", "worktree", "remove"] }], verdict: "partly", interrupt: !0, overrides: [], loses: { en: "The ignored files in it, such as .env, without any warning. With --force, also the changes that were not committed.", es: "Los archivos ignorados que contiene, como .env, sin avisar. Con --force, tambi\xE9n los cambios sin confirmar." }, keeps: { en: "The branch and its commits.", es: "La rama y sus commits." }, recover: [{ id: "add", gives: { en: "The folder, with what was committed.", es: "La carpeta, con lo que estaba confirmado." }, run: ["git worktree add <folder> <branch>"] }], autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "git 2.56.1", platform: "darwin", date: "2026-11-26" }, { version: "git 2.56.1", platform: "linux", date: "2026-11-26" }, { version: "git 2.56.1.windows.1", platform: "win32", date: "2026-11-26" }] } }, { id: "gh-repo-delete", tool: "github", example: "gh repo delete owner/repo", title: { en: "Delete a GitHub repository", es: "Borrar un repositorio de GitHub" }, match: [{ run: ["gh", "repo", "delete"] }], verdict: "partly", interrupt: !0, overrides: [], loses: { en: "Team permissions. If it has forks, maybe the whole repository.", es: "Los permisos de los equipos. Si tiene forks, quiz\xE1 todo el repositorio." }, recover: [{ id: "web", gives: { en: "The repository, on github.com: Settings, Repositories, Deleted repositories.", es: "El repositorio, en github.com: Settings, Repositories, Deleted repositories." }, run: [], until: { en: "90 days. It can take an hour to appear.", es: "90 d\xEDas. Puede tardar una hora en aparecer." } }], autocommit: !1, sources: [{ url: "https://docs.github.com/en/repositories/creating-and-managing-repositories/restoring-a-deleted-repository", checked: "2026-11-25" }, { url: "https://cli.github.com/manual/gh_repo_delete", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "heroku-apps-destroy", tool: "heroku", example: "heroku apps:destroy --app shop", title: { en: "Delete a Heroku app", es: "Borrar una app de Heroku" }, match: [{ run: ["heroku", "apps:destroy"] }, { run: ["heroku", "apps:delete"] }, { run: ["heroku", "addons:destroy"] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "The app or the add-on. Heroku describes it as permanent.", es: "La app o el complemento. Heroku lo describe como permanente." }, recover: [], autocommit: !1, sources: [{ url: "https://devcenter.heroku.com/articles/heroku-cli-commands", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "heroku-pg-reset", tool: "heroku", example: "heroku pg:reset --app shop", title: { en: "Empty a Heroku database", es: "Vaciar una base de datos de Heroku" }, match: [{ run: ["heroku", "pg:reset"] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "All the data in the database.", es: "Todos los datos de la base." }, recover: [], before: { note: { en: "Make a copy: heroku pg:backups:capture", es: "Haz una copia: heroku pg:backups:capture" }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://devcenter.heroku.com/articles/heroku-cli-commands", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "helm-uninstall", tool: "kubernetes", example: "helm uninstall shop", title: { en: "Uninstall a Helm release", es: "Desinstalar una versi\xF3n de Helm" }, match: [{ run: ["helm", "uninstall"], without: [["--dry-run"]] }, { run: ["helm", "delete"], without: [["--dry-run"]] }, { run: ["helm", "un"], without: [["--dry-run"]] }, { run: ["helm", "del"], without: [["--dry-run"]] }], verdict: "partly", interrupt: !0, overrides: [], loses: { en: "The history of the release and the values that you did not keep in a file.", es: "El historial y los valores que no guardaste en un archivo." }, recover: [{ id: "install", gives: { en: "The release again, with the values you have.", es: "La instalaci\xF3n otra vez, con los valores que tengas." }, run: ["helm install <release> <chart> --values <file>"] }], instead: { note: { en: "--keep-history keeps the history. helm get values shows the values.", es: "--keep-history conserva el historial. helm get values muestra los valores." }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://helm.sh/docs/helm/helm_uninstall/", checked: "2026-11-25" }, { url: "https://helm.sh/docs/helm/helm_install/", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "kubectl-delete-namespace", tool: "kubernetes", example: "kubectl delete namespace shop", title: { en: "Delete a namespace", es: "Borrar un namespace" }, match: [{ run: ["kubectl", "delete", "namespace"], without: [["--dry-run"]] }, { run: ["kubectl", "delete", "namespaces"], without: [["--dry-run"]] }, { run: ["kubectl", "delete", "ns"], without: [["--dry-run"]] }, { run: ["oc", "delete", "project"], without: [["--dry-run"]] }, { run: ["kubectl", "delete"], without: [["--dry-run"]], operands: { any: ["ns/*", "namespace/*", "namespaces/*"] } }], verdict: "no", interrupt: !0, overrides: ["kubectl-delete"], loses: { en: "Everything in it, including secrets and the requests for volumes.", es: "Todo lo que contiene, incluidos los secretos y las solicitudes de vol\xFAmenes." }, recover: [], before: { note: { en: "See what it has: kubectl get all --namespace <name>. That list leaves out secrets and volumes.", es: "Mira qu\xE9 tiene: kubectl get all --namespace <name>. Esa lista no incluye secretos ni vol\xFAmenes." }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://kubernetes.io/docs/tasks/administer-cluster/namespaces/", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "kubectl-delete-volume", tool: "kubernetes", example: "kubectl delete pvc shop-data", title: { en: "Delete a volume from a cluster", es: "Borrar un volumen de un cl\xFAster" }, match: [{ run: ["kubectl", "delete", "pvc"], without: [["--dry-run"]] }, { run: ["kubectl", "delete", "persistentvolumeclaim"], without: [["--dry-run"]] }, { run: ["kubectl", "delete", "persistentvolumeclaims"], without: [["--dry-run"]] }, { run: ["kubectl", "delete", "pv"], without: [["--dry-run"]] }, { run: ["kubectl", "delete", "persistentvolume"], without: [["--dry-run"]] }, { run: ["kubectl", "delete", "persistentvolumes"], without: [["--dry-run"]] }, { run: ["kubectl", "delete"], without: [["--dry-run"]], operands: { any: ["pvc/*", "persistentvolumeclaim/*", "pv/*", "persistentvolume/*"] } }], verdict: "no", interrupt: !0, overrides: ["kubectl-delete"], loses: { en: "The disk and its data, with the usual reclaim policy, which is Delete.", es: "El disco y sus datos, con la pol\xEDtica habitual, que es Delete." }, recover: [], before: { note: { en: "Change the reclaim policy of the volume to Retain, and take a snapshot.", es: "Cambia la pol\xEDtica del volumen a Retain y toma una instant\xE1nea." }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://kubernetes.io/docs/concepts/storage/persistent-volumes/", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "kubectl-delete", tool: "kubernetes", example: "kubectl delete deployment shop", title: { en: "Delete an object from a cluster", es: "Borrar un objeto de un cl\xFAster" }, match: [{ run: ["kubectl", "delete"], without: [["--dry-run"]] }, { run: ["oc", "delete"], without: [["--dry-run"]] }], verdict: "partly", interrupt: !0, overrides: [], loses: { en: "Whatever is only in the cluster. If it owns volumes, maybe their data too.", es: "Lo que solo estaba en el cl\xFAster. Si es due\xF1o de vol\xFAmenes, quiz\xE1 tambi\xE9n sus datos." }, keeps: { en: "The manifest, if you have it in a file.", es: "El manifiesto, si lo tienes en un archivo." }, recover: [{ id: "apply", gives: { en: "The object, as it is in its manifest.", es: "El objeto, como est\xE1 en su manifiesto." }, run: ["kubectl apply --filename <manifest>"] }], before: { note: { en: "Save it: kubectl get <kind> <name> --output yaml", es: "Gu\xE1rdalo: kubectl get <kind> <name> --output yaml" }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://kubernetes.io/docs/reference/kubectl/generated/kubectl_delete/", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "mongo-drop", tool: "mongodb", example: 'mongosh --eval "db.dropDatabase()"', title: { en: "Delete a database in MongoDB", es: "Borrar una base de datos en MongoDB" }, match: [{ run: ["mongosh"], operands: { any: ["*.dropdatabase(*"] } }, { run: ["mongo"], operands: { any: ["*.dropdatabase(*"] } }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "The database and its files.", es: "La base de datos y sus archivos." }, recover: [], before: { note: { en: "Make a copy with mongodump, and check that it restores.", es: "Haz una copia con mongodump y comprueba que se restaura." }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://www.mongodb.com/docs/manual/reference/method/db.dropdatabase/", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "mysql-drop", tool: "mysql", example: 'mysql -e "DROP TABLE users" shop', title: { en: "Delete or empty a table in MySQL", es: "Borrar o vaciar una tabla en MySQL" }, match: [{ sql: { dialects: ["mysql"], words: ["DROP", "TABLE"] } }, { sql: { dialects: ["mysql"], words: ["TRUNCATE"] } }, { sql: { dialects: ["mysql"], words: ["DROP", "DATABASE"] } }, { sql: { dialects: ["mysql"], words: ["DROP", "SCHEMA"] } }, { sql: { dialects: ["mysql"], words: ["ALTER", "TABLE", "...", "DROP"] } }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "The data. MySQL commits these statements on its own, so ROLLBACK does nothing, even inside a transaction.", es: "Los datos. MySQL confirma estas sentencias por su cuenta, as\xED que ROLLBACK no hace nada, ni dentro de una transacci\xF3n." }, recover: [], before: { note: { en: "Rename the table instead of deleting it, or copy it with mysqldump.", es: "Renombra la tabla en lugar de borrarla, o c\xF3piala con mysqldump." }, run: [], back: [] }, autocommit: !0, sources: [{ url: "https://dev.mysql.com/doc/refman/8.4/en/implicit-commit.html", checked: "2026-11-25" }, { url: "https://dev.mysql.com/doc/refman/8.4/en/cannot-roll-back.html", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "mysql-every-row", tool: "mysql", example: 'mysql -e "DELETE FROM users" shop', title: { en: "Delete or change every row in MySQL", es: "Borrar o cambiar todas las filas en MySQL" }, match: [{ sql: { dialects: ["mysql"], words: ["DELETE", "FROM"], everyRow: !0 } }, { sql: { dialects: ["mysql"], words: ["UPDATE", "...", "SET"], everyRow: !0 } }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "Every row, or its old values, because there is no WHERE. MySQL commits each statement unless you open a transaction.", es: "Todas las filas, o sus valores anteriores, porque no hay WHERE. MySQL confirma cada sentencia salvo que abras una transacci\xF3n." }, recover: [], instead: { note: { en: "With InnoDB tables, try it between START TRANSACTION and ROLLBACK.", es: "Con tablas InnoDB, pru\xE9balo entre START TRANSACTION y ROLLBACK." }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://dev.mysql.com/doc/refman/8.4/en/commit.html", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "npm-publish", tool: "npm", example: "npm publish", title: { en: "Publish a package on npm", es: "Publicar un paquete en npm" }, match: [{ run: ["npm", "publish"], without: [["--dry-run"]] }, { run: ["pnpm", "publish"], without: [["--dry-run"]] }, { run: ["yarn", "publish"], without: [["--dry-run"]] }, { run: ["yarn", "npm", "publish"], without: [["--dry-run"]] }, { run: ["bun", "publish"], without: [["--dry-run"]] }], verdict: "partly", interrupt: !0, overrides: [], loses: { en: "That version number, forever. Whoever installed it keeps it.", es: "Ese n\xFAmero de versi\xF3n, para siempre. Quien lo instal\xF3 se queda con \xE9l." }, recover: [{ id: "unpublish", gives: { en: "Takes that version off the registry, if no other package depends on it.", es: "Quita esa versi\xF3n del registro, si ning\xFAn otro paquete depende de ella." }, run: ["npm unpublish <package>@<version>"], until: { en: "72 hours. After that there are more conditions.", es: "72 horas. Despu\xE9s hay m\xE1s condiciones." }, risk: { en: "That version number can never be used again.", es: "Ese n\xFAmero de versi\xF3n no se puede volver a usar." } }], instead: { note: { en: "See what it would publish: npm publish --dry-run", es: "Mira qu\xE9 publicar\xEDa: npm publish --dry-run" }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://docs.npmjs.com/policies/unpublish/", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "npm-unpublish", tool: "npm", example: "npm unpublish my-package@1.0.0", title: { en: "Remove a package from npm", es: "Quitar un paquete de npm" }, match: [{ run: ["npm", "unpublish"], without: [["--dry-run"]] }, { run: ["pnpm", "unpublish"], without: [["--dry-run"]] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "That version, and its number can never be used again. If it was the last one, nothing can be published under that name for 24 hours.", es: "Esa versi\xF3n, y su n\xFAmero no se puede volver a usar. Si era la \xFAltima, no se puede publicar con ese nombre durante 24 horas." }, recover: [], instead: { note: { en: "npm deprecate warns whoever installs it, and breaks nobody.", es: "npm deprecate avisa a quien lo instala y no rompe a nadie." }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://docs.npmjs.com/policies/unpublish/", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "rm-node-modules", tool: "npm", example: "rm -rf node_modules", title: { en: "Delete installed packages", es: "Borrar los paquetes instalados" }, match: [{ run: ["rm"], operands: { every: ["node_modules", "*/node_modules", "node_modules/*", "*/node_modules/*"] } }, { run: ["rimraf"], operands: { every: ["node_modules", "*/node_modules"] } }, { run: ["remove-item"], operands: { every: ["node_modules", "*/node_modules", "node_modules/*", "*/node_modules/*"] } }], verdict: "yes", interrupt: !1, overrides: ["rm", "remove-item"], loses: { en: "Only changes made by hand inside that folder.", es: "Solo los cambios hechos a mano dentro de esa carpeta." }, recover: [{ id: "install", gives: { en: "The packages, with the same versions, if the project has a package-lock.json.", es: "Los paquetes, con las mismas versiones, si el proyecto tiene package-lock.json." }, run: ["npm ci"] }], autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "npm 11.19.1", platform: "darwin", date: "2026-11-26" }, { version: "npm 11.19.1", platform: "linux", date: "2026-11-26" }, { version: "npm 11.19.1", platform: "win32", date: "2026-11-26" }] } }, { id: "postgres-delete-all", tool: "postgres", example: 'psql -c "DELETE FROM users"', title: { en: "Delete every row of a table in PostgreSQL", es: "Borrar todas las filas de una tabla en PostgreSQL" }, match: [{ sql: { dialects: ["postgres"], words: ["DELETE", "FROM"], everyRow: !0 } }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "Every row, because there is no WHERE.", es: "Todas las filas, porque no hay WHERE." }, recover: [], instead: { note: { en: "Try it in a transaction that ends in ROLLBACK. To keep a copy, use pg_dump --table first.", es: "Pru\xE9balo en una transacci\xF3n que termine en ROLLBACK. Para guardar una copia, usa antes pg_dump --table." }, run: ['psql -c "BEGIN; DELETE FROM <table>; ROLLBACK"'], back: [] }, autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "PostgreSQL 17.5 (PGlite)", platform: "darwin", date: "2026-11-26" }, { version: "PostgreSQL 18.7 (Ubuntu 18.7-1.pgdg26.04+2)", platform: "linux", date: "2026-11-26" }, { version: "PostgreSQL 17.5 (PGlite)", platform: "win32", date: "2026-11-26" }] } }, { id: "postgres-drop-column", tool: "postgres", example: 'psql -c "ALTER TABLE users DROP COLUMN email"', title: { en: "Delete a column in PostgreSQL", es: "Borrar una columna en PostgreSQL" }, match: [{ sql: { dialects: ["postgres"], words: ["ALTER", "TABLE", "...", "DROP", "COLUMN"] } }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "The values of that column, in every row. Adding it again leaves it empty.", es: "Los valores de esa columna, en todas las filas. Al crearla de nuevo queda vac\xEDa." }, recover: [], instead: { note: { en: "Rename it first, and delete it when nothing needs it.", es: "Ren\xF3mbrala primero y b\xF3rrala cuando nada la necesite." }, run: ['psql -c "ALTER TABLE <table> RENAME COLUMN <column> TO <old-column>"'], back: ['psql -c "ALTER TABLE <table> RENAME COLUMN <old-column> TO <column>"'] }, autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "PostgreSQL 17.5 (PGlite)", platform: "darwin", date: "2026-11-26" }, { version: "PostgreSQL 18.7 (Ubuntu 18.7-1.pgdg26.04+2)", platform: "linux", date: "2026-11-26" }, { version: "PostgreSQL 17.5 (PGlite)", platform: "win32", date: "2026-11-26" }] } }, { id: "postgres-drop-database", tool: "postgres", example: 'psql -c "DROP DATABASE shop"', title: { en: "Delete a database in PostgreSQL", es: "Borrar una base de datos en PostgreSQL" }, match: [{ sql: { dialects: ["postgres"], words: ["DROP", "DATABASE"] } }, { run: ["dropdb"] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "The whole database. It cannot run inside a transaction, so there is no ROLLBACK.", es: "Toda la base. No puede ejecutarse dentro de una transacci\xF3n, as\xED que no hay ROLLBACK." }, recover: [], before: { note: { en: "Make a copy with pg_dump, and check that it restores.", es: "Haz una copia con pg_dump y comprueba que se restaura." }, run: [], back: [] }, autocommit: !0, sources: [{ url: "https://www.postgresql.org/docs/current/sql-dropdatabase.html", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "postgres-drop-schema", tool: "postgres", example: 'psql -c "DROP SCHEMA public CASCADE"', title: { en: "Delete a schema in PostgreSQL", es: "Borrar un esquema en PostgreSQL" }, match: [{ sql: { dialects: ["postgres"], words: ["DROP", "SCHEMA"] } }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "With CASCADE, all the tables, views and functions in it.", es: "Con CASCADE, todas sus tablas, vistas y funciones." }, recover: [], instead: { note: { en: "Rename it first, and delete it when nothing needs it.", es: "Ren\xF3mbralo primero y b\xF3rralo cuando nada lo necesite." }, run: ['psql -c "ALTER SCHEMA <schema> RENAME TO <old-schema>"'], back: ['psql -c "ALTER SCHEMA <old-schema> RENAME TO <schema>"'] }, autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "PostgreSQL 17.5 (PGlite)", platform: "darwin", date: "2026-11-26" }, { version: "PostgreSQL 18.7 (Ubuntu 18.7-1.pgdg26.04+2)", platform: "linux", date: "2026-11-26" }, { version: "PostgreSQL 17.5 (PGlite)", platform: "win32", date: "2026-11-26" }] } }, { id: "postgres-drop-table", tool: "postgres", example: 'psql -c "DROP TABLE users"', title: { en: "Delete a table in PostgreSQL", es: "Borrar una tabla en PostgreSQL" }, match: [{ sql: { dialects: ["postgres"], words: ["DROP", "TABLE"] } }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "The table and its rows. With CASCADE, also the views and keys that depend on it.", es: "La tabla y sus filas. Con CASCADE, tambi\xE9n las vistas y claves que dependen de ella." }, recover: [], instead: { note: { en: "Try it in a transaction that ends in ROLLBACK. To keep a copy, use pg_dump --table first.", es: "Pru\xE9balo en una transacci\xF3n que termine en ROLLBACK. Para guardar una copia, usa antes pg_dump --table." }, run: ['psql -c "BEGIN; DROP TABLE <table>; ROLLBACK"'], back: [] }, autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "PostgreSQL 17.5 (PGlite)", platform: "darwin", date: "2026-11-26" }, { version: "PostgreSQL 18.7 (Ubuntu 18.7-1.pgdg26.04+2)", platform: "linux", date: "2026-11-26" }, { version: "PostgreSQL 17.5 (PGlite)", platform: "win32", date: "2026-11-26" }] } }, { id: "postgres-truncate", tool: "postgres", example: 'psql -c "TRUNCATE users"', title: { en: "Empty a table in PostgreSQL", es: "Vaciar una tabla en PostgreSQL" }, match: [{ sql: { dialects: ["postgres"], words: ["TRUNCATE"] } }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "Every row. With CASCADE, also the rows of the tables that refer to it.", es: "Todas las filas. Con CASCADE, tambi\xE9n las de las tablas que la referencian." }, recover: [], instead: { note: { en: "Try it in a transaction that ends in ROLLBACK. To keep a copy, use pg_dump --table first.", es: "Pru\xE9balo en una transacci\xF3n que termine en ROLLBACK. Para guardar una copia, usa antes pg_dump --table." }, run: ['psql -c "BEGIN; TRUNCATE <table>; ROLLBACK"'], back: [] }, autocommit: !1, sources: [{ url: "https://www.postgresql.org/docs/current/sql-truncate.html", checked: "2026-11-25" }], evidence: { kind: "tested", runs: [{ version: "PostgreSQL 17.5 (PGlite)", platform: "darwin", date: "2026-11-26" }, { version: "PostgreSQL 18.7 (Ubuntu 18.7-1.pgdg26.04+2)", platform: "linux", date: "2026-11-26" }, { version: "PostgreSQL 17.5 (PGlite)", platform: "win32", date: "2026-11-26" }] } }, { id: "postgres-update-all", tool: "postgres", example: 'psql -c "UPDATE users SET active = false"', title: { en: "Change every row of a table in PostgreSQL", es: "Cambiar todas las filas de una tabla en PostgreSQL" }, match: [{ sql: { dialects: ["postgres"], words: ["UPDATE", "...", "SET"], everyRow: !0 } }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "The old values of those columns, in every row, because there is no WHERE.", es: "Los valores anteriores de esas columnas, en todas las filas, porque no hay WHERE." }, recover: [], instead: { note: { en: "Try it in a transaction that ends in ROLLBACK. To keep a copy, use pg_dump --table first.", es: "Pru\xE9balo en una transacci\xF3n que termine en ROLLBACK. Para guardar una copia, usa antes pg_dump --table." }, run: ['psql -c "BEGIN; UPDATE <table> SET <column> = 0; ROLLBACK"'], back: [] }, autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "PostgreSQL 17.5 (PGlite)", platform: "darwin", date: "2026-11-26" }, { version: "PostgreSQL 18.7 (Ubuntu 18.7-1.pgdg26.04+2)", platform: "linux", date: "2026-11-26" }, { version: "PostgreSQL 17.5 (PGlite)", platform: "win32", date: "2026-11-26" }] } }, { id: "pypi-upload", tool: "python", example: "twine upload dist/*", title: { en: "Publish a package on PyPI", es: "Publicar un paquete en PyPI" }, match: [{ run: ["twine", "upload"], without: [["--dry-run"]] }, { run: ["uv", "publish"], without: [["--dry-run"]] }, { run: ["poetry", "publish"], without: [["--dry-run"]] }, { run: ["flit", "publish"], without: [["--dry-run"]] }, { run: ["hatch", "publish"], without: [["--dry-run"]] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "That file name, forever. It can be deleted, but not uploaded again.", es: "Ese nombre de archivo, para siempre. Se puede borrar, pero no volver a subir." }, recover: [], instead: { note: { en: "Try it on TestPyPI first. To stop new installs of a version, yank it on the PyPI website.", es: "Pru\xE9balo antes en TestPyPI. Para frenar nuevas instalaciones, m\xE1rcala como \xAByank\xBB en la web de PyPI." }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://docs.pypi.org/project-management/troubleshooting/", checked: "2026-11-25" }, { url: "https://docs.pypi.org/publishing/troubleshooting/", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "railway-volume-delete", tool: "railway", example: "railway volume delete", title: { en: "Delete a Railway volume", es: "Borrar un volumen de Railway" }, match: [{ run: ["railway", "volume", "delete"] }, { run: ["railway", "volume", "remove"] }, { run: ["railway", "volume", "rm"] }], verdict: "partly", interrupt: !0, overrides: [], loses: { en: "Everything in the volume, when the time is up.", es: "Todo lo que hay en el volumen, cuando se acaba el plazo." }, recover: [{ id: "email", gives: { en: "The volume, with the link in the email that Railway sends.", es: "El volumen, con el enlace del correo que env\xEDa Railway." }, run: [], until: { en: "48 hours.", es: "48 horas." } }], autocommit: !1, sources: [{ url: "https://docs.railway.com/volumes/reference", checked: "2026-11-25" }, { url: "https://docs.railway.com/volumes/backups", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "redis-flush", tool: "redis", example: "redis-cli FLUSHALL", title: { en: "Delete everything in Redis", es: "Borrar todo en Redis" }, match: [{ run: ["redis-cli"], operands: { any: ["flushall", "flushdb"] } }, { run: ["valkey-cli"], operands: { any: ["flushall", "flushdb"] } }], verdict: "partly", interrupt: !0, overrides: [], loses: { en: "Every key. It also empties the snapshot on disk (RDB).", es: "Todas las claves. Tambi\xE9n vac\xEDa la copia en disco (RDB)." }, keeps: { en: "The append-only file, if it was on and has not been rewritten since.", es: "El archivo AOF, si estaba activo y no se ha reescrito desde entonces." }, recover: [{ id: "aof", gives: { en: "With the append-only file on: stop the server, delete the FLUSHALL at the end of the file, and start it again.", es: "Con el archivo AOF activo: det\xE9n el servidor, borra el FLUSHALL del final del archivo y vuelve a iniciarlo." }, run: [], until: { en: "Until Redis rewrites the file, so stop the server right away.", es: "Hasta que Redis reescriba el archivo, as\xED que det\xE9n el servidor de inmediato." } }], autocommit: !1, sources: [{ url: "https://redis.io/docs/latest/commands/flushall/", checked: "2026-11-25" }, { url: "https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "sqlite-delete-all", tool: "sqlite", example: 'sqlite3 app.db "DELETE FROM users"', title: { en: "Delete every row of a table in SQLite", es: "Borrar todas las filas de una tabla en SQLite" }, match: [{ sql: { dialects: ["sqlite"], words: ["DELETE", "FROM"], everyRow: !0 } }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "Every row of the table.", es: "Todas las filas de la tabla." }, recover: [], before: { note: { en: "Close the programs that use the database and copy the file.", es: "Cierra los programas que usan la base y copia el archivo." }, run: ["cp <database> <copy>"], back: ["cp <copy> <database>"] }, autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "SQLite 3.50.6", platform: "darwin", date: "2026-11-26" }, { version: "SQLite 3.46.1", platform: "linux", date: "2026-11-26" }, { version: "SQLite 3.49.1", platform: "win32", date: "2026-11-26" }] } }, { id: "sqlite-drop-table", tool: "sqlite", example: 'sqlite3 app.db "DROP TABLE users"', title: { en: "Delete a table in SQLite", es: "Borrar una tabla en SQLite" }, match: [{ sql: { dialects: ["sqlite"], words: ["DROP", "TABLE"] } }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "The table, with its rows, indexes and triggers.", es: "La tabla, con sus filas, \xEDndices y disparadores." }, recover: [], before: { note: { en: "Close the programs that use the database and copy the file.", es: "Cierra los programas que usan la base y copia el archivo." }, run: ["cp <database> <copy>"], back: ["cp <copy> <database>"] }, autocommit: !1, sources: [{ url: "https://sqlite.org/lang_droptable.html", checked: "2026-11-25" }], evidence: { kind: "tested", runs: [{ version: "SQLite 3.50.6", platform: "darwin", date: "2026-11-26" }, { version: "SQLite 3.46.1", platform: "linux", date: "2026-11-26" }, { version: "SQLite 3.49.1", platform: "win32", date: "2026-11-26" }] } }, { id: "sqlite-update-all", tool: "sqlite", example: 'sqlite3 app.db "UPDATE users SET active = 0"', title: { en: "Change every row of a table in SQLite", es: "Cambiar todas las filas de una tabla en SQLite" }, match: [{ sql: { dialects: ["sqlite"], words: ["UPDATE", "...", "SET"], everyRow: !0 } }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "The old values of those columns, in every row.", es: "Los valores anteriores de esas columnas, en todas las filas." }, recover: [], before: { note: { en: "Close the programs that use the database and copy the file.", es: "Cierra los programas que usan la base y copia el archivo." }, run: ["cp <database> <copy>"], back: ["cp <copy> <database>"] }, autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "SQLite 3.50.6", platform: "darwin", date: "2026-11-26" }, { version: "SQLite 3.46.1", platform: "linux", date: "2026-11-26" }, { version: "SQLite 3.49.1", platform: "win32", date: "2026-11-26" }] } }, { id: "supabase-db-reset", tool: "supabase", example: "supabase db reset", title: { en: "Create a Supabase database again", es: "Volver a crear una base de datos de Supabase" }, match: [{ run: ["supabase", "db", "reset"] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "All the data that is not in a migration or in the seed file. With --remote or --linked, in the real database.", es: "Todos los datos que no est\xE9n en una migraci\xF3n o en el archivo de datos iniciales. Con --remote o --linked, en la base real." }, recover: [], before: { note: { en: "Make a copy with supabase db dump, and check which database it points to.", es: "Haz una copia con supabase db dump y comprueba a qu\xE9 base apunta." }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://supabase.com/docs/reference/cli/supabase-db-reset", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "crontab-remove", tool: "system", example: "crontab -r", title: { en: "Delete all your scheduled tasks", es: "Borrar todas tus tareas programadas" }, match: [{ run: ["crontab"], with: [["-r"]], without: [["-i"]] }], verdict: "partly", interrupt: !0, overrides: [], loses: { en: "All of them, with no question. Some systems keep no copy.", es: "Todas, sin preguntar. Algunos sistemas no guardan copia." }, keeps: { en: "With cronie, the last version is saved in ~/.cache/crontab/crontab.bak.", es: "Con cronie, la \xFAltima versi\xF3n queda en ~/.cache/crontab/crontab.bak." }, recover: [{ id: "cronie", gives: { en: "The tasks, on systems with cronie.", es: "Las tareas, en sistemas con cronie." }, run: ["crontab <backup-file>"] }], before: { note: { en: "Save the output of crontab -l.", es: "Guarda la salida de crontab -l." }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://man7.org/linux/man-pages/man1/crontab.1.html", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "mkfs", tool: "system", example: "mkfs.ext4 /dev/sdb1", title: { en: "Format a disk", es: "Formatear un disco" }, match: [{ run: ["mkfs"], without: [["-n"]] }, { run: ["mke2fs"], without: [["-n"]] }, { run: ["mkfs.ext2"], without: [["-n"]] }, { run: ["mkfs.ext3"], without: [["-n"]] }, { run: ["mkfs.ext4"], without: [["-n"]] }, { run: ["mkfs.xfs"], without: [["-n"]] }, { run: ["mkfs.btrfs"], without: [["-n"]] }, { run: ["mkfs.fat"], without: [["-n"]] }, { run: ["mkfs.vfat"], without: [["-n"]] }, { run: ["mkfs.ntfs"], without: [["-n"]] }, { run: ["mkfs.exfat"], without: [["-n"]] }, { run: ["mkswap"], without: [["-n"]] }, { run: ["wipefs"], with: [["-a", "--all"]] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "The files on that disk. The new file system replaces the old one.", es: "Los archivos de ese disco. El nuevo sistema de archivos reemplaza al anterior." }, recover: [], before: { note: { en: "Check the device with lsblk. mke2fs -n shows what it would do.", es: "Revisa el dispositivo con lsblk. mke2fs -n muestra lo que har\xEDa." }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://man7.org/linux/man-pages/man8/mke2fs.8.html", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "terraform-destroy", tool: "terraform", example: "terraform destroy", title: { en: "Delete all the infrastructure", es: "Borrar toda la infraestructura" }, match: [{ run: ["terraform", "destroy"] }, { run: ["tofu", "destroy"] }, { run: ["terraform", "apply"], with: [["-destroy", "--destroy"]] }, { run: ["tofu", "apply"], with: [["-destroy", "--destroy"]] }], verdict: "partly", interrupt: !0, overrides: [], loses: { en: "The data in it, such as databases, disks and buckets.", es: "Los datos que contiene, como bases de datos, discos y buckets." }, keeps: { en: "The configuration. It creates the same things again, but empty.", es: "La configuraci\xF3n. Vuelve a crear lo mismo, pero vac\xEDo." }, recover: [{ id: "apply", gives: { en: "The same infrastructure, new and empty.", es: "La misma infraestructura, nueva y vac\xEDa." }, run: ["terraform apply"] }], instead: { note: { en: "See what it would delete: terraform plan -destroy", es: "Mira qu\xE9 borrar\xEDa: terraform plan -destroy" }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://developer.hashicorp.com/terraform/cli/commands/destroy", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "terraform-state-rm", tool: "terraform", example: "terraform state rm aws_instance.web", title: { en: "Make Terraform forget something", es: "Hacer que Terraform olvide algo" }, match: [{ run: ["terraform", "state", "rm"], without: [["-dry-run", "--dry-run"]] }, { run: ["tofu", "state", "rm"], without: [["-dry-run", "--dry-run"]] }], verdict: "yes", interrupt: !0, overrides: [], loses: { en: "Only the link. The real thing keeps running, and the next plan would create another one.", es: "Solo el v\xEDnculo. Lo real sigue funcionando, y el pr\xF3ximo plan crear\xEDa otro." }, recover: [{ id: "import", gives: { en: "The link.", es: "El v\xEDnculo." }, run: ["terraform import <address> <id>"] }], autocommit: !1, sources: [{ url: "https://developer.hashicorp.com/terraform/cli/commands/state/rm", checked: "2026-11-25" }, { url: "https://developer.hashicorp.com/terraform/cli/commands/import", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "vercel-remove", tool: "vercel", example: "vercel remove my-shop", title: { en: "Delete a Vercel deployment or project", es: "Borrar un despliegue o proyecto de Vercel" }, match: [{ run: ["vercel", "remove"] }, { run: ["vercel", "rm"] }], verdict: "partly", interrupt: !0, overrides: [], loses: { en: "The deployment. With the name of a project, the project and all of them.", es: "El despliegue. Con el nombre de un proyecto, el proyecto y todos ellos." }, recover: [{ id: "web", gives: { en: "A deployment, on vercel.com: project Settings, Security, Recently Deleted. Vercel does not say the same of a whole project.", es: "Un despliegue, en vercel.com: Settings del proyecto, Security, Recently Deleted. Vercel no dice lo mismo de un proyecto entero." }, run: [], until: { en: "From 1 to 30 days, depending on its age.", es: "De 1 a 30 d\xEDas, seg\xFAn su antig\xFCedad." } }], instead: { note: { en: "--safe leaves alone the ones that are in use.", es: "--safe no toca los que est\xE1n en uso." }, run: [], back: [] }, autocommit: !1, sources: [{ url: "https://vercel.com/docs/cli/remove", checked: "2026-11-25" }, { url: "https://vercel.com/docs/deployment-retention", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "clear-content", tool: "windows", example: "Clear-Content app.log", title: { en: "Empty a file in PowerShell", es: "Vaciar un archivo en PowerShell" }, match: [{ run: ["clear-content"], without: [["-WhatIf"]] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "What the file had.", es: "Lo que ten\xEDa el archivo." }, recover: [], before: { note: { en: "Keep a copy.", es: "Guarda una copia." }, run: ["Copy-Item <file> <copy>"], back: ["Copy-Item <copy> <file>"] }, autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "PowerShell 7.6.10", platform: "darwin", date: "2026-11-26" }, { version: "PowerShell 7.6.10", platform: "linux", date: "2026-11-26" }, { version: "PowerShell 5.1.26100.33822", platform: "win32", date: "2026-11-26" }] } }, { id: "clear-recyclebin", tool: "windows", example: "Clear-RecycleBin -Force", title: { en: "Empty the Recycle Bin", es: "Vaciar la Papelera de reciclaje" }, match: [{ run: ["clear-recyclebin"], without: [["-WhatIf"]] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "Everything in the Recycle Bin.", es: "Todo lo que hab\xEDa en la Papelera." }, recover: [], autocommit: !1, sources: [{ url: "https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/clear-recyclebin", checked: "2026-11-25" }], evidence: { kind: "documented" } }, { id: "cmd-delete", tool: "windows", example: 'cmd /c "rd /s /q folder"', title: { en: "Delete files in the Windows command prompt", es: "Borrar archivos en el s\xEDmbolo del sistema de Windows" }, match: [{ run: ["rd"], with: [["/s", "/S"]] }, { run: ["rmdir"], with: [["/s", "/S"]] }, { run: ["del"] }, { run: ["erase"] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "The files. They do not go to the Recycle Bin.", es: "Los archivos. No van a la Papelera de reciclaje." }, recover: [], autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "PowerShell 5.1.26100.33822", platform: "win32", date: "2026-11-26" }] } }, { id: "remove-item", tool: "windows", example: "Remove-Item -Recurse folder", title: { en: "Delete files in PowerShell", es: "Borrar archivos en PowerShell" }, match: [{ run: ["remove-item"], without: [["-WhatIf"]] }], verdict: "no", interrupt: !0, overrides: [], loses: { en: "The files. They do not go to the Recycle Bin.", es: "Los archivos. No van a la Papelera de reciclaje." }, recover: [], instead: { note: { en: "Move it somewhere else, and delete it when you are sure.", es: "Mu\xE9velo a otro lugar y b\xF3rralo cuando est\xE9s seguro." }, run: ["Move-Item <path> <elsewhere>"], back: ["Move-Item <elsewhere> <path>"] }, autocommit: !1, sources: [{ url: "https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/remove-item", checked: "2026-11-25" }], evidence: { kind: "tested", runs: [{ version: "PowerShell 7.6.10", platform: "darwin", date: "2026-11-26" }, { version: "PowerShell 7.6.10", platform: "linux", date: "2026-11-26" }, { version: "PowerShell 5.1.26100.33822", platform: "win32", date: "2026-11-26" }] } }, { id: "set-content", tool: "windows", example: "Set-Content notes.txt hello", title: { en: "Write over a file in PowerShell", es: "Escribir encima de un archivo en PowerShell" }, match: [{ run: ["set-content"], without: [["-WhatIf"]] }, { run: ["out-file"], without: [["-WhatIf"], ["-Append"], ["-NoClobber"]] }], verdict: "no", interrupt: !1, overrides: [], loses: { en: "What the file had, if it already existed.", es: "Lo que ten\xEDa el archivo, si ya exist\xEDa." }, recover: [], before: { note: { en: "Keep a copy. Add-Content adds to the end and deletes nothing.", es: "Guarda una copia. Add-Content agrega al final y no borra nada." }, run: ["Copy-Item <file> <copy>"], back: ["Copy-Item <copy> <file>"] }, autocommit: !1, sources: [], evidence: { kind: "tested", runs: [{ version: "PowerShell 7.6.10", platform: "darwin", date: "2026-11-26" }, { version: "PowerShell 7.6.10", platform: "linux", date: "2026-11-26" }, { version: "PowerShell 5.1.26100.33822", platform: "win32", date: "2026-11-26" }] } }];

// src/shell.ts
var KEYWORDS = /* @__PURE__ */ new Set(["if", "then", "elif", "else", "fi", "while", "until", "do", "done", "esac", "time", "!", "{", "}", "coproc"]), PS_KEYWORDS = /* @__PURE__ */ new Set(["if", "else", "elseif", "foreach", "for", "while", "do", "try", "catch", "finally", "return", "process", "begin", "end", "&", "."]);
function parse(command, dialect = "posix", depth = 0) {
  return command.length > 1e5 || depth > 8 ? { invocations: [], unreadable: !0 } : new Reader(command.replace(/\r\n/g, `
`), dialect, depth).read();
}
var Reader = class {
  i = 0;
  out = [];
  unreadable = !1;
  stage;
  /** The word after `function` is a name. */
  naming = !1;
  word = "";
  inWord = !1;
  dynamic = !1;
  pendingRedirect;
  waiting = [];
  start = 0;
  s;
  dialect;
  depth;
  ps;
  constructor(s, dialect, depth) {
    this.s = s, this.dialect = dialect, this.depth = depth, this.ps = dialect === "powershell", this.stage = this.fresh();
  }
  fresh() {
    return { words: [], redirects: [], source: "", powershell: this.ps };
  }
  read() {
    let { s } = this;
    for (; this.i < s.length; ) {
      let c = s[this.i], next = s[this.i + 1];
      if (c === (this.ps ? "`" : "\\"))
        next !== `
` && this.add(next ?? ""), this.i += 2;
      else if (c === "'") this.single();
      else if (c === '"') this.double();
      else if (c === "$") this.dollar();
      else if (c === "`") this.backtick();
      else if (c === "#" && !this.inWord)
        for (; this.i < s.length && s[this.i] !== `
`; ) this.i++;
      else c === " " || c === "	" ? (this.endWord(), this.i++) : c === `
` ? (this.endStage(), this.i++, this.readHeredocs()) : c === ";" || c === "(" || c === ")" ? (this.endStage(), this.i++) : (c === "&" || c === "|") && next === c ? (this.endStage(), this.i += 2) : c === "|" ? this.pipe(next === "&" ? 2 : 1) : c === "&" && next === ">" ? this.redirect(s[this.i + 2] === ">" ? "&>>" : "&>") : c === "&" ? ((!this.ps || this.inWord || this.stage.words.length > 0) && this.endStage(), this.i++) : c === "<" || c === ">" ? this.angle() : (c === "{" || c === "}") && this.ps ? (this.endStage(), this.i++) : (this.add(c), this.i++);
    }
    return this.endStage(), this.waiting.length > 0 && (this.unreadable = !0), { invocations: this.out.map(({ words, redirects, stdin: stdin2, source, powershell: powershell2 }) => ({ words, redirects, source, powershell: powershell2, ...stdin2 === void 0 ? {} : { stdin: stdin2 } })), unreadable: this.unreadable };
  }
  add(text) {
    this.inWord || (this.inWord = !0, this.stage.words.length === 0 && this.stage.redirects.length === 0 && (this.start = this.i)), this.word += text;
  }
  single() {
    let { s } = this;
    for (this.add(""), this.i++; ; ) {
      let end = s.indexOf("'", this.i);
      if (end < 0) {
        this.unreadable = !0, this.add(s.slice(this.i)), this.i = s.length;
        return;
      }
      if (this.add(s.slice(this.i, end)), this.i = end + 1, !this.ps || s[this.i] !== "'") return;
      this.add("'"), this.i++;
    }
  }
  double() {
    let { s } = this;
    for (this.add(""), this.i++; this.i < s.length; ) {
      let c = s[this.i];
      if (c === '"') {
        if (this.ps && s[this.i + 1] === '"') {
          this.add('"'), this.i += 2;
          continue;
        }
        this.i++;
        return;
      }
      if (this.ps && c === "`")
        this.add(s[this.i + 1] ?? ""), this.i += 2;
      else if (!this.ps && c === "\\") {
        let next = s[this.i + 1] ?? "";
        next !== `
` && this.add(next !== "" && '$`"\\'.includes(next) ? next : c + next), this.i += 2;
      } else c === "$" ? this.dollar() : c === "`" ? this.backtick() : (this.add(c), this.i++);
    }
    this.unreadable = !0;
  }
  dollar() {
    let { s } = this, next = s[this.i + 1];
    if (next === "(") {
      let end = closing(s, this.i + 1, "(", ")"), body = s.slice(this.i + 2, end < 0 ? s.length : end);
      end < 0 && (this.unreadable = !0), this.add(""), this.dynamic = !0, body.startsWith("(") || this.nested(body), this.i = end < 0 ? s.length : end + 1;
    } else if (next === "'" && !this.ps)
      this.i++, this.ansi();
    else if (next === "{") {
      let end = closing(s, this.i + 1, "{", "}");
      end < 0 && (this.unreadable = !0);
      let stop = end < 0 ? s.length : end + 1;
      this.add(s.slice(this.i, stop)), this.dynamic = !0, this.i = stop;
    } else {
      let name = /^\$(\w+|[@*#?$!-])/.exec(s.slice(this.i, this.i + 80));
      this.add(name ? name[0] : "$"), name && (this.dynamic = !0), this.i += name ? name[0].length : 1;
    }
  }
  /** $'a\nb' */
  ansi() {
    let { s } = this;
    for (this.add(""), this.i++; this.i < s.length; ) {
      let c = s[this.i];
      if (c === "'") {
        this.i++;
        return;
      }
      if (c !== "\\") {
        this.add(c), this.i++;
        continue;
      }
      let rest = s.slice(this.i + 1, this.i + 10), code = /^(?:x([0-9a-fA-F]{1,2})|u([0-9a-fA-F]{1,4})|([0-7]{1,3}))/.exec(rest);
      if (code)
        this.add(String.fromCharCode(code[3] === void 0 ? parseInt(code[1] ?? code[2], 16) : parseInt(code[3], 8))), this.i += 1 + code[0].length;
      else {
        let known = { n: `
`, t: "	", r: "\r", a: "", b: "", e: "" }, next = rest[0] ?? "";
        this.add(known[next] ?? next), this.i += 2;
      }
    }
    this.unreadable = !0;
  }
  backtick() {
    let { s } = this, end = this.i + 1;
    for (; end < s.length && s[end] !== "`"; ) end += s[end] === "\\" ? 2 : 1;
    end >= s.length && (this.unreadable = !0), this.add(""), this.dynamic = !0, this.nested(s.slice(this.i + 1, end).replace(/\\([`$\\])/g, "$1")), this.i = end + 1;
  }
  nested(body) {
    let inner = parse(body, this.dialect, this.depth + 1);
    inner.unreadable && (this.unreadable = !0), this.out.push(...inner.invocations);
  }
  angle() {
    let { s } = this;
    if (s[this.i + 1] === "(" && !this.ps) {
      let end = closing(s, this.i + 1, "(", ")");
      end < 0 && (this.unreadable = !0), this.add(""), this.dynamic = !0, this.nested(s.slice(this.i + 2, end < 0 ? s.length : end)), this.i = end < 0 ? s.length : end + 1;
      return;
    }
    this.redirect(/^(?:<<<|<<-|<<|<>|<&|<|>>|>&|>\||>)/.exec(s.slice(this.i, this.i + 3))[0]);
  }
  redirect(op) {
    let stream = "";
    this.inWord && /^(?:\d{1,2}|\*)$/.test(this.word) && !this.dynamic ? (stream = this.word, this.word = "", this.inWord = !1) : this.endWord(), this.stage.words.length === 0 && this.stage.redirects.length === 0 && (this.start = this.i), this.i += op.length, this.pendingRedirect = stream + op;
  }
  endWord() {
    if (!this.inWord) return;
    let word = { text: this.word, dynamic: this.dynamic };
    this.word = "", this.inWord = !1, this.dynamic = !1;
    let op = this.pendingRedirect;
    if (op !== void 0) {
      this.pendingRedirect = void 0, op.endsWith("<<<") ? this.stage.stdin = word.text : /<<-?$/.test(op) ? this.waiting.push({ stage: this.stage, tag: word.text, strip: op.endsWith("-") }) : this.stage.redirects.push({ op, target: word.text });
      return;
    }
    if (this.stage.words.length === 0 && !word.dynamic) {
      if (this.ps ? PS_KEYWORDS.has(word.text.toLowerCase()) : KEYWORDS.has(word.text)) return;
      if (this.naming) {
        this.naming = !1;
        return;
      }
      if (word.text === "function" && !this.ps) {
        this.naming = !0;
        return;
      }
    }
    this.stage.words.push(word);
  }
  endStage() {
    this.endWord(), this.pendingRedirect = void 0;
    let done = this.stage;
    return (done.words.length > 0 || done.redirects.length > 0) && (done.source = this.s.slice(this.start, this.i).trim(), this.out.push(done)), this.stage = this.fresh(), done;
  }
  pipe(length) {
    let from = this.endStage();
    this.i += length, this.stage.pipedFrom = from;
    let text = printed(from);
    text !== void 0 && (this.stage.stdin = text);
  }
  readHeredocs() {
    for (; this.waiting.length > 0; ) {
      let { stage, tag, strip } = this.waiting.shift(), lines = [], closed = !1;
      for (; this.i < this.s.length && !closed; ) {
        let eol = this.s.indexOf(`
`, this.i), raw = this.s.slice(this.i, eol < 0 ? this.s.length : eol);
        this.i = eol < 0 ? this.s.length : eol + 1;
        let line = strip ? raw.replace(/^\t+/, "") : raw;
        line === tag ? closed = !0 : lines.push(line);
      }
      closed || (this.unreadable = !0), stage.stdin = lines.join(`
`);
      let text = printed(stage);
      if (text !== void 0) for (let other of this.out) other.pipedFrom === stage && (other.stdin = text);
    }
  }
};
function printed(stage) {
  let [program, ...args] = stage.words.map((w) => w.text);
  if (program === "echo" || program === "printf" || program?.toLowerCase() === "write-output")
    return args.filter((a) => !/^-[neE]+$/.test(a)).join(" ").replace(/\\n/g, `
`);
  if (program === "cat" && args.every((a) => a === "-")) return stage.stdin;
  if (stage.words.length === 1 && program?.includes(" ")) return program;
}
function closing(s, from, open, close) {
  let depth = 0;
  for (let i = from; i < s.length; i++) {
    let c = s[i];
    if (c === "\\") i++;
    else if (c === "'") {
      let end = s.indexOf("'", i + 1);
      if (end < 0) return -1;
      i = end;
    } else if (c === '"') {
      for (i++; i < s.length && s[i] !== '"'; ) i += s[i] === "\\" ? 2 : 1;
      if (i >= s.length) return -1;
    } else if (c === open) depth++;
    else if (c === close && --depth === 0) return i;
  }
  return -1;
}

// src/unwrap.ts
var MAX_DEPTH = 8, WRAPPERS = {
  sudo: { takes: ["-u", "-g", "-h", "-p", "-C", "-r", "-t", "-U", "-D", "-R", "-T", "--user", "--group", "--chdir", "--prompt"] },
  doas: { takes: ["-u", "-C"] },
  env: { takes: ["-u", "-C", "--unset", "--chdir"] },
  nohup: {},
  setsid: {},
  builtin: {},
  caffeinate: {},
  winpty: {},
  busybox: {},
  unbuffer: {},
  chronic: {},
  exec: { takes: ["-a"] },
  nice: { takes: ["-n", "--adjustment"] },
  ionice: { takes: ["-c", "-n", "--class", "--classdata"] },
  time: { takes: ["-f", "-o"] },
  timeout: { takes: ["-s", "-k", "--signal", "--kill-after"], skip: 1 },
  gtimeout: { takes: ["-s", "-k"], skip: 1 },
  stdbuf: { takes: ["-i", "-o", "-e"] },
  watch: { takes: ["-n", "--interval"] },
  xargs: { takes: ["-I", "-n", "-P", "-L", "-d", "-s", "-E", "-a", "--max-args", "--max-procs", "--max-lines", "--delimiter", "--arg-file", "--replace"] },
  parallel: { takes: ["-j", "--jobs", "-n", "-N"] },
  npx: { takes: ["-p", "--package", "-w"] },
  bunx: {},
  pnpm: { sub: ["exec", "dlx"] },
  yarn: { sub: ["exec", "dlx"] },
  npm: { sub: ["exec", "x"] },
  bun: { sub: ["x"] },
  uv: { sub: ["run"], takes: ["--with", "--python", "-p", "--project", "--directory"] },
  poetry: { sub: ["run"] },
  pipenv: { sub: ["run"] },
  bundle: { sub: ["exec"] },
  op: { sub: ["run"], takes: ["--env-file", "--account"] },
  doppler: { sub: ["run"], takes: ["-p", "-c", "--project", "--config", "-t", "--token"] },
  mise: { sub: ["exec", "x"] },
  "aws-vault": { sub: ["exec"], takes: ["-d", "--duration", "-n"], skip: 1 },
  dotenv: { takes: ["-e", "-f", "--file"] }
}, SHELLS = /* @__PURE__ */ new Set(["bash", "sh", "zsh", "dash", "ksh", "ash", "fish"]), REMOTES = [
  { path: ["docker", "compose", "exec"], takes: ["-e", "--env", "-u", "--user", "-w", "--workdir", "--index"], skip: 1 },
  { path: ["docker", "compose", "run"], takes: ["-e", "--env", "-u", "--user", "-w", "--workdir", "-v", "--volume", "-p", "--publish", "--entrypoint", "--name", "-l", "--label"], skip: 1 },
  { path: ["docker", "exec"], takes: ["-e", "--env", "--env-file", "-u", "--user", "-w", "--workdir", "--detach-keys"], skip: 1 },
  { path: ["docker", "container", "exec"], takes: ["-e", "--env", "--env-file", "-u", "--user", "-w", "--workdir"], skip: 1 },
  { path: ["docker-compose", "exec"], takes: ["-e", "--env", "-u", "--user", "-w", "--workdir", "--index"], skip: 1 },
  { path: ["podman", "exec"], takes: ["-e", "--env", "-u", "--user", "-w", "--workdir"], skip: 1 },
  { path: ["kubectl", "exec"], takes: ["-n", "--namespace", "-c", "--container", "--context", "--kubeconfig", "-f", "--filename"], skip: 1 }
], programName = (text) => text.replace(/^.*[\\/]/, "").replace(/\.(?:exe|cmd|bat|ps1|com)$/i, "").toLowerCase();
function commands(line, dialect) {
  let parsed = parse(line, dialect), out = { invocations: [], unreadable: parsed.unreadable };
  for (let i of parsed.invocations) unwrap(i, dialect, 0, out);
  return out;
}
function commandOf(words, dialect) {
  let out = { invocations: [], unreadable: !1 };
  return unwrap({ words: words.map((text) => ({ text, dynamic: !1 })), redirects: [], source: words.join(" "), powershell: dialect === "powershell" }, dialect, 0, out), out;
}
function unwrap(i, dialect, depth, out) {
  if (depth > MAX_DEPTH) {
    out.unreadable = !0;
    return;
  }
  let words = dropAssignments(i.words, dialect), inside = (rest2) => unwrap({ ...i, words: rest2 }, dialect, depth + 1, out), text = (line, as) => {
    let parsed = parse(line, as, depth + 1);
    parsed.unreadable && (out.unreadable = !0);
    for (let x of parsed.invocations) unwrap(x, as, depth + 1, out);
  }, first = words[0];
  if (!first) {
    out.invocations.push({ ...i, words });
    return;
  }
  let name = programName(first.text), rest = words.slice(1);
  if (SHELLS.has(name)) {
    let at = rest.findIndex((w) => /^-[a-z]*c[a-z]*$/i.test(w.text)), script = at < 0 ? i.stdin : rest.slice(at + 1).find((w) => !w.text.startsWith("-"))?.text;
    if (script !== void 0) {
      text(script, "posix");
      return;
    }
  } else if (name === "eval") {
    text(rest.map((w) => w.text).join(" "), dialect);
    return;
  } else if (name === "su") {
    let at = rest.findIndex((w) => w.text === "-c" || w.text === "--command");
    if (at >= 0) {
      text(rest[at + 1]?.text ?? "", "posix");
      return;
    }
  } else if (name === "cmd") {
    let at = rest.findIndex((w) => /^[/]+[ck]$/i.test(w.text));
    if (at >= 0) {
      text(rest.slice(at + 1).map((w) => w.text).join(" ").replace(/\\/g, "/"), "posix");
      return;
    }
  } else if (name === "powershell" || name === "pwsh") {
    if (powershell(rest, i.stdin, text)) return;
  } else if (name === "invoke-expression" || name === "iex") {
    text(rest.filter((w) => !w.text.startsWith("-")).map((w) => w.text).join(" "), "powershell");
    return;
  } else if (name === "ssh") {
    let at = skipOptions(rest, ["-b", "-c", "-D", "-E", "-e", "-F", "-I", "-i", "-J", "-L", "-l", "-m", "-O", "-o", "-p", "-R", "-S", "-W", "-w", "-B", "-P", "-Q"], 1);
    if (at < rest.length) {
      text(rest.slice(at).map((w) => w.text).join(" "), "posix");
      return;
    }
  } else if (name === "find") {
    out.invocations.push({ ...i, words });
    let from = -1;
    rest.forEach((w, n) => {
      if (/^-(?:exec|execdir|ok|okdir)$/.test(w.text)) from = n + 1;
      else if (from >= 0 && (w.text === ";" || w.text === "+" || n === rest.length - 1)) {
        let end = w.text === ";" || w.text === "+" ? n : n + 1;
        inside(rest.slice(from, end)), from = -1;
      }
    });
    return;
  } else if (name === "command" && !rest.some((w) => /^-[vV]/.test(w.text))) {
    inside(rest.filter((w, n) => !(n === 0 && w.text === "-p")));
    return;
  }
  for (let remote of REMOTES) {
    let path = [name, ...rest.map((w) => w.text)], at = matchPath(path, remote.path);
    if (at < 0) continue;
    let dashes = rest.findIndex((w, n) => n >= at - 1 && w.text === "--"), from = name === "kubectl" && dashes >= 0 ? dashes + 1 : at - 1 + skipOptions(rest.slice(at - 1), remote.takes, remote.skip);
    from < rest.length && inside(rest.slice(from));
    return;
  }
  let wrapper = WRAPPERS[name];
  if (wrapper) {
    let from = 0;
    if (wrapper.sub) {
      if (from = rest.findIndex((w) => !w.text.startsWith("-")), from < 0 || !wrapper.sub.includes(rest[from].text)) {
        out.invocations.push({ ...i, words });
        return;
      }
      from++;
    }
    let tail = rest.slice(from);
    if (name === "env") {
      let split = tail.findIndex((w) => w.text === "-S" || w.text === "--split-string");
      if (split >= 0) {
        text(tail.slice(split + 1).map((w) => w.text).join(" "), "posix");
        return;
      }
    }
    if (name === "npx") {
      let call = tail.findIndex((w) => w.text === "-c" || w.text === "--call");
      if (call >= 0) {
        text(tail[call + 1]?.text ?? "", "posix");
        return;
      }
    }
    let at = skipOptions(tail, wrapper.takes ?? [], wrapper.skip ?? 0), target = tail.slice(at);
    if (target.length > 0) {
      (name === "watch" || name === "parallel") && target.length === 1 ? text(target[0].text, "posix") : inside(target);
      return;
    }
  }
  out.invocations.push({ ...i, words });
}
function powershell(rest, stdin2, text) {
  let takesValue = /^-(?:ex|ep|executionpolicy|v|version|w|windowstyle|psc|configurationname|wd|workingdirectory|inputformat|if|outputformat|of|settingsfile)/i;
  for (let n = 0; n < rest.length; n++) {
    let word = rest[n].text;
    if (/^-(?:e|ec|en|enc\w*)$/i.test(word)) {
      let raw = rest[n + 1]?.text ?? "";
      return text(decode(raw), "powershell"), !0;
    }
    if (/^-(?:f|fi\w*)$/i.test(word)) return !1;
    if (/^-(?:c|co\w*)$/i.test(word))
      return text(rest.slice(n + 1).map((w) => w.text).join(" "), "powershell"), !0;
    if (takesValue.test(word)) {
      n++;
      continue;
    }
    if (!word.startsWith("-"))
      return text(rest.slice(n).map((w) => w.text).join(" "), "powershell"), !0;
  }
  return stdin2 !== void 0 ? (text(stdin2, "powershell"), !0) : !1;
}
function decode(base64) {
  try {
    let bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return new TextDecoder("utf-16le").decode(bytes);
  } catch {
    return '"';
  }
}
function dropAssignments(words, dialect) {
  if (dialect === "powershell") return /^\$[\w:]+$/.test(words[0]?.text ?? "") && /^[-+]?=$/.test(words[1]?.text ?? "") ? words.slice(2) : words;
  let n = 0;
  for (; n < words.length && /^[A-Za-z_]\w*\+?=/.test(words[n].text); ) n++;
  return words.slice(n);
}
function skipOptions(words, takes, skip) {
  let n = 0, left = skip;
  for (; n < words.length; ) {
    let w = words[n].text;
    if (w === "--") return n + 1 + left;
    if (/^[A-Za-z_]\w*=/.test(w) && left === 0) n++;
    else if (w.startsWith("-") && w.length > 1) n += takes.includes(w) ? 2 : 1;
    else if (left > 0)
      left--, n++;
    else return n;
  }
  return n;
}
function matchPath(words, path) {
  let p = 0;
  for (let n = 0; n < words.length; n++) {
    let w = words[n];
    if (w === path[p]) {
      if (++p === path.length) return n + 1;
    } else {
      if (n === 0) return -1;
      if (w.startsWith("-"))
        words[n + 1] !== path[p] && n++;
      else return -1;
    }
  }
  return -1;
}

// src/args.ts
var COMPOSE = {
  takes: ["-f", "--file", "-p", "--project-name", "--profile", "--env-file", "--project-directory", "--parallel", "--progress", "--ansi"],
  sub: { down: { takes: ["-t", "--timeout", "--rmi"] }, rm: {} }
}, TOOLS = {
  git: {
    shortens: !0,
    takes: ["-C", "-c", "--git-dir", "--work-tree", "--namespace", "--exec-path", "--config-env", "--super-prefix"],
    sub: {
      clean: { takes: ["-e", "--exclude"] },
      commit: { takes: ["-m", "-F", "-C", "-c", "-t", "--message", "--file", "--author", "--date", "--fixup", "--squash"] },
      push: { takes: ["-o", "--push-option", "--repo", "--receive-pack"] },
      rebase: { takes: ["-s", "-X", "-x", "--onto", "--exec", "--strategy", "--strategy-option"] },
      merge: { takes: ["-m", "-s", "-X", "-F", "--strategy", "--strategy-option", "--into-name"] },
      restore: { takes: ["-s", "--source", "--conflict", "--pathspec-from-file"] },
      checkout: { takes: ["-b", "-B", "--orphan", "--conflict", "--pathspec-from-file"] },
      switch: { takes: ["-c", "-C", "--orphan", "--conflict"] },
      branch: { takes: ["-u", "--set-upstream-to", "--contains", "--merged", "--no-merged", "--sort", "--format", "--points-at"] },
      tag: { takes: ["-m", "-F", "-u", "--message", "--sort", "--format", "--contains", "--points-at"] },
      "cherry-pick": { takes: ["-m", "-s", "-X", "--mainline"] },
      revert: { takes: ["-m", "-s", "-X", "--mainline"] },
      worktree: {},
      stash: {},
      reflog: {},
      gc: {}
    }
  },
  docker: { anywhere: [], takes: ["-H", "--host", "-c", "--context", "--config", "-l", "--log-level", "--tlscacert", "--tlscert", "--tlskey"], sub: { compose: COMPOSE } },
  podman: { takes: ["--url", "--connection", "-c", "--log-level", "--root", "--runroot"], sub: { compose: COMPOSE } },
  "docker-compose": COMPOSE,
  kubectl: { anywhere: ["-n", "--namespace", "--context", "--kubeconfig", "-s", "--server", "--cluster", "--user", "--as", "--as-group", "--token", "--request-timeout", "-o", "--output", "-l", "--selector", "-f", "--filename", "--field-selector", "--grace-period", "--timeout", "--cascade", "-k", "--kustomize"] },
  helm: { anywhere: ["-n", "--namespace", "--kube-context", "--kubeconfig", "--timeout", "--description"] },
  terraform: { wordy: !0 },
  tofu: { wordy: !0 },
  aws: { anywhere: ["--profile", "--region", "--output", "--endpoint-url", "--query", "--ca-bundle", "--color", "--cli-read-timeout", "--cli-connect-timeout"] },
  gcloud: { anywhere: ["--project", "--account", "--configuration", "--format", "--verbosity", "--billing-project", "--impersonate-service-account"] },
  az: { anywhere: ["--subscription", "--output", "-o", "--query", "-n", "--name", "-g", "--resource-group"] },
  npm: { anywhere: ["--prefix", "-w", "--workspace", "--registry", "--otp", "--tag", "--access", "--loglevel", "--cache"] },
  pnpm: { anywhere: ["--filter", "-F", "--dir", "-C", "--registry", "--otp", "--tag"] },
  yarn: { anywhere: ["--cwd"] },
  cargo: { anywhere: ["--manifest-path", "--registry", "--token", "-p", "--package", "--config", "--color", "--target-dir"] },
  gh: { anywhere: ["-R", "--repo"] },
  heroku: { anywhere: ["-a", "--app", "-r", "--remote", "-c", "--confirm"] },
  fly: { anywhere: ["-a", "--app", "-c", "--config", "-t", "--access-token"] },
  flyctl: { anywhere: ["-a", "--app", "-c", "--config", "-t", "--access-token"] },
  supabase: { anywhere: ["--workdir", "--profile", "--version", "--last"] },
  firebase: { anywhere: ["-P", "--project", "--account", "--token", "--database", "--only"] },
  railway: { anywhere: ["-s", "--service", "-e", "--environment", "-v", "--volume", "-p", "--project"] },
  vercel: { anywhere: ["-S", "--scope", "-t", "--token", "-A", "--local-config", "-Q", "--global-config", "--cwd"] },
  "redis-cli": { anywhere: ["-h", "-p", "-a", "-n", "-u", "--user", "--pass", "-s", "-r", "-i"] },
  "valkey-cli": { anywhere: ["-h", "-p", "-a", "-n", "-u", "--user", "--pass", "-s", "-r", "-i"] },
  mongosh: { anywhere: ["--host", "--port", "-u", "--username", "-p", "--password", "--authenticationDatabase", "-f", "--file"] },
  find: { wordy: !0 },
  rsync: { shortens: !0, anywhere: ["-e", "--rsh", "--exclude", "--include", "--filter", "-f", "--exclude-from", "--include-from", "--files-from", "--bwlimit", "--log-file"] },
  rm: { shortens: !0 },
  mv: { shortens: !0, takes: ["-t", "--target-directory", "-S", "--suffix"] },
  cp: { shortens: !0, takes: ["-t", "--target-directory", "-S", "--suffix"] },
  chmod: { shortens: !0, takes: ["--reference"] },
  chown: { shortens: !0, takes: ["--reference", "--from"] },
  truncate: { shortens: !0, takes: ["-s", "--size", "-r", "--reference"] },
  shred: { shortens: !0, takes: ["-n", "-s", "--iterations", "--size", "--random-source"] },
  sed: { shortens: !0, takes: ["-e", "-f", "--expression", "--file", "-l"] },
  tee: { shortens: !0 }
}, POWERSHELL = { wordy: !0, anyCase: !0 }, isCmdlet = (name) => /^[a-z]+-[a-z]+$/.test(name) && PS_VERBS.has(name.split("-")[0]), PS_VERBS = /* @__PURE__ */ new Set(["remove", "clear", "set", "move", "copy", "rename", "stop", "format", "out", "reset", "new", "get", "restart", "uninstall", "disable"]), PS_ALIASES = {
  rm: "remove-item",
  ri: "remove-item",
  rd: "remove-item",
  rmdir: "remove-item",
  del: "remove-item",
  erase: "remove-item",
  clc: "clear-content",
  mv: "move-item",
  move: "move-item",
  mi: "move-item",
  cp: "copy-item",
  copy: "copy-item",
  cpi: "copy-item",
  sc: "set-content"
}, OFF = /* @__PURE__ */ new Set(["false", "none", "no", "0", "never"]);
function readArgs(i) {
  let raw = programName(i.words[0]?.text ?? ""), program = i.powershell ? PS_ALIASES[raw] ?? raw : raw, tool = isCmdlet(program) ? POWERSHELL : TOOLS[program] ?? {}, flags = [], operands = [], level = tool, anywhere = new Set(tool.anywhere ?? []), dashes = !1, previousFlag = !1, words = i.words.slice(1);
  for (let n = 0; n < words.length; n++) {
    let { text, dynamic } = words[n];
    if (dashes) {
      operands.push({ text, dynamic, afterDashes: !0, maybeValue: !1 });
      continue;
    }
    if (text === "--") {
      dashes = !0, previousFlag = !1;
      continue;
    }
    let slash = /^\/[a-z?]$/i.test(text) && ["rd", "rmdir", "del", "erase", "format"].includes(raw);
    if (text.startsWith("-") && text.length > 1 || slash) {
      let eq = text.indexOf(text.startsWith("--") || tool.wordy ? "=" : "\0"), colon = tool.anyCase ? text.indexOf(":") : -1, cut = eq > 0 ? eq : colon, name = cut > 0 ? text.slice(0, cut) : text, takes = (flag) => anywhere.has(flag) || (level?.takes?.includes(flag) ?? !1);
      if (cut > 0) {
        flags.push({ text: name, value: text.slice(cut + 1) }), previousFlag = !1;
        continue;
      }
      if (text.startsWith("--") || tool.wordy || slash || text.length === 2) {
        flags.push({ text: name }), takes(name) && n + 1 < words.length ? (n++, previousFlag = !1) : previousFlag = !0;
        continue;
      }
      flags.push({ text: name }), previousFlag = !0;
      for (let k = 1; k < text.length; k++) {
        let letter = `-${text[k]}`;
        if (flags.push({ text: letter }), !!takes(letter)) {
          k === text.length - 1 && n++, previousFlag = !1;
          break;
        }
      }
      continue;
    }
    operands.push({ text, dynamic, afterDashes: !1, maybeValue: previousFlag });
    let inner = level?.sub?.[text];
    inner && (level = inner), previousFlag = !1;
  }
  let same = (a, b) => tool.anyCase ? a.toLowerCase() === b.toLowerCase() : a === b, matches = (given, wanted) => same(given, wanted) ? !0 : tool.shortens && given.startsWith("--") && given.length > 3 ? wanted.startsWith(given) : tool.anyCase && given.length > 1 ? wanted.toLowerCase().startsWith(given.toLowerCase()) : !1;
  return {
    program,
    operands,
    has: (spellings) => spellings.some((wanted) => {
      let eq = wanted.startsWith("--") ? wanted.indexOf("=") : -1;
      return eq > 0 ? flags.some((f) => f.value === wanted.slice(eq + 1) && matches(f.text, wanted.slice(0, eq))) : flags.some((f) => (f.value === void 0 || !OFF.has(f.value.toLowerCase().replace(/^\$/, ""))) && matches(f.text, wanted));
    })
  };
}
function afterSubcommand(args, words) {
  let n = 0;
  for (let word of words) {
    for (; n < args.operands.length && args.operands[n].text !== word && args.operands[n].maybeValue; ) n++;
    if (args.operands[n]?.text !== word || args.operands[n].afterDashes) return;
    n++;
  }
  return args.operands.slice(n);
}

// src/sql.ts
var CLIENTS = {
  psql: { dialect: "postgres", options: ["-c", "--command"] },
  pgcli: { dialect: "postgres", options: ["-c", "--command"] },
  mysql: { dialect: "mysql", options: ["-e", "--execute"] },
  mariadb: { dialect: "mysql", options: ["-e", "--execute"] },
  mycli: { dialect: "mysql", options: ["-e", "--execute"] },
  sqlite3: { dialect: "sqlite", options: ["-cmd"], operand: 1 },
  litecli: { dialect: "sqlite", options: ["-e", "--execute"] }
}, MAX_SQL = 1e5;
function sqlOf(i) {
  let client = CLIENTS[programName(i.words[0]?.text ?? "")];
  if (!client) return;
  let texts = [], words = i.words.slice(1).map((w) => w.text), operands = 0;
  for (let n = 0; n < words.length; n++) {
    let w = words[n], option = client.options.find((o) => w === o || (o.startsWith("--") ? w.startsWith(`${o}=`) : o.length === 2 && w.startsWith(o)));
    option ? w === option ? texts.push(words[++n] ?? "") : texts.push(w.slice(option.length).replace(/^=/, "")) : !w.startsWith("-") && client.operand !== void 0 && (operands >= client.operand && texts.push(w), operands++);
  }
  return i.stdin !== void 0 && texts.push(i.stdin), { dialect: client.dialect, statements: texts.flatMap((t2) => statements(t2)) };
}
var VERBS = /^\s*(?:drop\s+(?:table|database|schema)|truncate\s+[^-\s]|delete\s+from|update\s+\S+\s+set|alter\s+table|begin\s*;|start\s+transaction\s*;|with\s+\w+\s+as\s|explain\s)/i, looksLikeSql = (text) => VERBS.test(text);
function statements(sql) {
  let text = sql.slice(0, MAX_SQL), out = [], tokens = [], start = 0, end = (at) => {
    tokens.length > 0 && out.push({ tokens, source: text.slice(start, at).trim(), rolledBack: !1 }), tokens = [], start = at + 1;
  }, i = 0;
  for (; i < text.length; ) {
    let c = text[i], two = text.slice(i, i + 2);
    if (two === "--" || c === "#") {
      let eol = text.indexOf(`
`, i);
      i = eol < 0 ? text.length : eol;
    } else if (two === "/*") {
      let close = text.indexOf("*/", i + 2);
      i = close < 0 ? text.length : close + 2;
    } else if (c === "'" || c === '"' || c === "`") {
      let j = i + 1;
      for (; j < text.length; )
        if (text[j] === "\\" && c === "'") j += 2;
        else if (text[j] !== c) j++;
        else if (text[j + 1] === c) j += 2;
        else break;
      tokens.push(c === "'" ? "''" : '""'), i = j + 1;
    } else if (c === "$" && /^\$\w*\$/.test(text.slice(i, i + 64))) {
      let tag = /^\$\w*\$/.exec(text.slice(i, i + 64))[0], close = text.indexOf(tag, i + tag.length);
      tokens.push("''"), i = close < 0 ? text.length : close + tag.length;
    } else if (c === ";")
      end(i), i++;
    else if (/\s/.test(c)) i++;
    else {
      let word = /^[A-Za-z_][\w$]*|^\d[\w.]*/.exec(text.slice(i, i + 128))?.[0] ?? c;
      tokens.push(word.toUpperCase()), i += word.length;
    }
  }
  return end(text.length), markRolledBack(out), out;
}
function markRolledBack(all) {
  let open;
  for (let s of all) {
    let [first, second] = s.tokens;
    if (first === "BEGIN" || first === "START" && second === "TRANSACTION") open = [];
    else if (first === "ROLLBACK" && second !== "TO" && open) {
      for (let x of open) x.rolledBack = !0;
      open = void 0;
    } else first === "COMMIT" || first === "END" ? open = void 0 : open?.push(s);
  }
}
function sqlMatches(rule, s) {
  if (rule.everyRow && !everyRow(s.tokens)) return !1;
  for (let at = 0; at < s.tokens.length; at++) {
    let before = s.tokens[at - 1];
    if (!(at > 0 && before !== "(" && !(before === "ANALYZE" && s.tokens[0] === "EXPLAIN") && !(before === ")" && s.tokens[0] === "WITH")) && startsWith(s.tokens, at, rule.words))
      return !0;
  }
  return !1;
}
function startsWith(tokens, at, words) {
  let n = at;
  for (let w = 0; w < words.length; w++)
    if (words[w] === "...") {
      let next = words[w + 1];
      if (n = tokens.indexOf(next, n), n < 0) return !1;
    } else {
      if (tokens[n] !== words[w]) return !1;
      n++;
    }
  return !0;
}
function everyRow(tokens) {
  let where = tokens.indexOf("WHERE");
  if (where < 0) return !0;
  let rest = tokens.slice(where + 1);
  return rest[0] === "TRUE" && rest.length === 1 || rest.length === 3 && rest[1] === "=" && rest[0] === rest[2];
}

// src/analyze.ts
var ORDER = ["yes", "partly", "no"], worst = (findings) => findings.map((f) => f.entry.verdict).sort((a, b) => ORDER.indexOf(b) - ORDER.indexOf(a))[0], BUILTINS = /* @__PURE__ */ new Set(["cd", "echo", "printf", "export", "set", "unset", "true", "false", ":", "test", "[", "[[", "exit", "return", "read", "for", "case", "local", "declare", "shift", "wait", "pwd", "break", "continue", "function", "cat", "write-output", "write-host", "set-location"]);
function analyze(line, entries2, options = {}) {
  let dialect = options.dialect ?? "posix";
  if (looksLikeSql(line)) {
    let findings = statements(line).flatMap((s) => sqlFindings(s, entries2, ["postgres", "mysql", "sqlite"]));
    if (findings.length > 0) return { command: line, findings, unknown: [], unreadable: !1 };
  }
  return judge(line, commands(line, dialect), entries2);
}
function analyzeWords(words, entries2, options = {}) {
  let dialect = options.dialect ?? "posix";
  return judge(words.join(" "), commandOf(words, dialect), entries2);
}
function judge(line, found, entries2) {
  let findings = [], unknown = [], { unreadable } = found;
  for (let i of found.invocations) {
    let here = match(i, entries2);
    findings.push(...here);
    let program = i.words[0];
    here.length > 0 || !program || BUILTINS.has(program.text.toLowerCase()) || (program.dynamic || program.text === "" ? unreadable = !0 : unknown.push(shortName(i)));
  }
  let seen = /* @__PURE__ */ new Set(), distinct = findings.filter((f) => {
    let key = `${f.entry.id}\0${f.source}`;
    return seen.has(key) ? !1 : (seen.add(key), !0);
  });
  return { command: line, findings: distinct, unknown: [...new Set(unknown)], unreadable };
}
function match(i, entries2) {
  let out = [], args = readArgs(i);
  for (let entry of entries2)
    entry.match.some((m) => m.redirect ? overwrites(i) : m.run !== void 0 && matchesRun(m, args)) && out.push({ entry, source: i.source });
  let sql = sqlOf(i);
  if (sql) for (let s of sql.statements) out.push(...sqlFindings(s, entries2, [sql.dialect]));
  return specific(out);
}
function specific(findings) {
  return findings.filter((f) => !findings.some((other) => other !== f && other.source === f.source && other.entry.overrides.includes(f.entry.id)));
}
function sqlFindings(s, entries2, dialects) {
  return specific(entries2.filter((e) => !(s.rolledBack && !e.autocommit)).filter((e) => e.match.some((m) => m.sql !== void 0 && m.sql.dialects.some((d) => dialects.includes(d)) && sqlMatches(m.sql, s))).map((entry) => ({ entry, source: s.source })));
}
function matchesRun(m, args) {
  let [program, ...sub] = m.run;
  if (program !== args.program) return !1;
  let operands = afterSubcommand(args, sub);
  return !operands || m.with && !m.with.every((f) => args.has(f)) || m.without && m.without.some((f) => args.has(f)) ? !1 : m.operands === void 0 || matchesOperands(m.operands, operands);
}
function matchesOperands(rule, operands) {
  return !(rule.min !== void 0 && operands.length < rule.min || rule.max !== void 0 && operands.length > rule.max || rule.any && !operands.some((o) => rule.any.some((p) => like(o.text, p))) || rule.none && operands.some((o) => rule.none.some((p) => like(o.text, p))) || rule.every && (operands.length === 0 || !operands.every((o) => !o.dynamic && rule.every.some((p) => like(o.text, p)))) || rule.afterDashes && !operands.some((o) => o.afterDashes));
}
function like(text, pattern) {
  let normal = (s) => s.replace(/\\/g, "/").toLowerCase(), t2 = normal(text).replace(/(.)\/+$/, "$1"), parts = normal(pattern).split("*");
  if (parts.length === 1) return t2 === parts[0];
  if (!t2.startsWith(parts[0])) return !1;
  let at = parts[0].length;
  for (let part of parts.slice(1, -1)) {
    let found = t2.indexOf(part, at);
    if (found < 0) return !1;
    at = found + part.length;
  }
  let last = parts.at(-1);
  return t2.length - at >= last.length && t2.endsWith(last);
}
var NOWHERE = /^(?:&?-|&?\d|\/dev\/(?:null|stdout|stderr|tty|fd\/\d+)|\$null|nul)$/i;
function overwrites(i) {
  return i.redirects.some((r) => /^(?:\d{0,2}|\*|&)>\|?$/.test(r.op) && !NOWHERE.test(r.target));
}
function shortName(i) {
  let [program, second] = i.words.map((w) => w.text);
  return second !== void 0 && /^[a-z][a-z-]{1,20}$/.test(second) && !i.words[1].dynamic ? `${program} ${second}` : program;
}

// src/data.ts
async function entries() {
  return define_CANIUNDO_ENTRIES_default;
}
var version = () => "0.1.0";

// src/i18n.ts
var VERDICT_TEXT = {
  yes: { en: "YES", es: "S\xCD" },
  partly: { en: "PARTLY", es: "EN PARTE" },
  no: { en: "NO", es: "NO" },
  unknown: { en: "NOT KNOWN", es: "NO SE SABE" }
}, MESSAGES = {
  lost: { en: "Lost", es: "Se pierde" },
  kept: { en: "Kept", es: "Se conserva" },
  instead: { en: "Instead", es: "Mejor" },
  before: { en: "Before", es: "Antes" },
  back: { en: "and to go back", es: "y para volver" },
  recover: { en: "To undo", es: "Deshacer" },
  risk: { en: "Careful", es: "Cuidado" },
  tested: { en: "Tested", es: "Probado" },
  documented: { en: "Documented, not tested", es: "Documentado, no probado" },
  source: { en: "Source", es: "Fuente" },
  notKnown: {
    en: "Not in the database: {what}. That does not mean that it can be undone.",
    es: "No est\xE1 en la base: {what}. Eso no significa que se pueda deshacer."
  },
  unreadable: {
    en: "Part of the command could not be read.",
    es: "No se pudo leer una parte del comando."
  },
  nothingFound: { en: "Nothing found for: {what}", es: "No encontr\xE9 nada para: {what}" },
  oopsFirst: {
    en: "Stop before doing anything else: what is deleted can be overwritten.",
    es: "No hagas nada m\xE1s todav\xEDa: lo borrado se puede sobrescribir."
  },
  hookNo: { en: "cannot be undone", es: "no se puede deshacer" },
  hookPartly: { en: "can only be undone in part", es: "solo se puede deshacer en parte" },
  hookYes: { en: "can be undone, for a while", es: "se puede deshacer, por un tiempo" },
  hookMore: { en: "and {n} more", es: "y {n} m\xE1s" },
  hookAsk: { en: "It has not run yet: a person has to approve it.", es: "Todav\xEDa no se ejecut\xF3: una persona tiene que aprobarlo." },
  hookStop: {
    en: "caniundo stopped this command. Use the safer way, or explain to the user what would be lost and let them run it.",
    es: "caniundo detuvo este comando. Usa la forma m\xE1s segura, o explica a la persona qu\xE9 se perder\xEDa y deja que lo ejecute."
  },
  hookUndo: { en: "If this was a mistake, tell the user before doing anything else.", es: "Si fue un error, avisa a la persona antes de hacer nada m\xE1s." },
  listCount: { en: "{n} entries, {tested} tested", es: "{n} fichas, {tested} probadas" }
};
function t(lang, key, vars = {}) {
  return MESSAGES[key][lang].replace(/\{(\w+)\}/g, (_m, name) => String(vars[name] ?? ""));
}
var PLATFORMS = { win32: "Windows", linux: "Linux", darwin: "macOS" };
function evidenceText(e, lang) {
  if (e.kind === "documented") return t(lang, "documented");
  let runs = e.runs.map((r) => `${r.version}, ${PLATFORMS[r.platform] ?? r.platform}, ${r.date}`);
  return `${t(lang, "tested")}: ${runs.join("; ")}`;
}
function detectLang(env = process.env) {
  let locale = env.LC_ALL || env.LC_MESSAGES || env.LANG || Intl.DateTimeFormat().resolvedOptions().locale;
  return /^es\b|^es_/i.test(locale) ? "es" : "en";
}
var isLang = (v) => v === "en" || v === "es";

// src/sanitize.ts
var UNSAFE = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}\p{Cs}\p{Co}]/gu;
function clean(text, max = 160) {
  let visible = text.slice(0, 2e4).replace(/\s*\n\s*/g, " \u23CE ").replace(/\t/g, " ").replace(UNSAFE, (c) => `<U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}>`).trim(), chars = [...visible];
  if (chars.length <= max) return visible;
  let tail = Math.floor(max / 3);
  return `${chars.slice(0, max - tail - 3).join("")} \u2026 ${chars.slice(-tail).join("")}`;
}
function safeJson(value) {
  return JSON.stringify(value, null, 2).replace(/[^ -~\n]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
}

// src/hook.ts
var MAX_SHOWN = 3;
function hookOptions(env) {
  let mode = env.CLAUDE_PLUGIN_OPTION_MODE ?? env.CANIUNDO_MODE, lang = env.CLAUDE_PLUGIN_OPTION_LANGUAGE ?? env.CANIUNDO_LANG;
  return { mode: mode === "steer" || mode === "note" ? mode : "ask", lang: isLang(lang) ? lang : detectLang(env) };
}
function answer(input, entries2, o) {
  let call = input, command = call?.tool_input?.command;
  if (call?.hook_event_name !== "PreToolUse" || typeof command != "string" || call.tool_name !== "Bash" && call.tool_name !== "PowerShell") return;
  let findings = analyze(command, entries2, { dialect: call.tool_name === "PowerShell" ? "powershell" : "posix" }).findings.filter((f) => f.entry.interrupt);
  if (findings.length === 0) return;
  let reason = explain(findings, o.lang), base = { hookEventName: "PreToolUse" };
  return o.mode === "note" ? { hookSpecificOutput: { ...base, additionalContext: `${reason}
${t(o.lang, "hookUndo")}` } } : o.mode === "steer" ? { hookSpecificOutput: { ...base, permissionDecision: "deny", permissionDecisionReason: `${reason}
${t(o.lang, "hookStop")}` } } : { hookSpecificOutput: { ...base, permissionDecision: "ask", permissionDecisionReason: `${reason}
${t(o.lang, "hookAsk")}`, additionalContext: `${reason}
${t(o.lang, "hookUndo")}` } };
}
function explain(findings, lang) {
  let out = [];
  for (let { entry, source } of findings.slice(0, MAX_SHOWN)) {
    let verdict = t(lang, entry.verdict === "no" ? "hookNo" : entry.verdict === "partly" ? "hookPartly" : "hookYes");
    out.push(`caniundo: "${clean(source, 100)}" ${verdict}.`), out.push(`${t(lang, "lost")}: ${entry.loses[lang]}`);
    let safer = entry.instead ?? entry.before;
    safer && out.push(`${t(lang, entry.instead ? "instead" : "before")}: ${safer.note[lang]}${steps(safer.run)}`);
    for (let r of entry.recover) out.push(`${t(lang, "recover")}: ${r.gives[lang]}${steps(r.run)}${r.until ? ` ${r.until[lang]}` : ""}`);
    out.push(`(${evidenceText(entry.evidence, lang)})`);
  }
  return findings.length > MAX_SHOWN && out.push(t(lang, "hookMore", { n: findings.length - MAX_SHOWN })), out.join(`
`);
}
var steps = (run) => run.length > 0 ? ` [ ${run.join(" ; ")} ]` : "";

// src/report.ts
var COLORS = { yes: "1;32", partly: "1;33", no: "1;31", unknown: "1;35" }, MARKS = { yes: "\u2713", partly: "~", no: "\u2717", unknown: "?" }, paint = (o, code, text) => o.color ? `\x1B[${code}m${text}\x1B[0m` : text;
function wrap(text, width) {
  let out = [], line = "";
  for (let word of text.split(" "))
    line !== "" && line.length + word.length + 1 > width ? (out.push(line), line = word) : line = line === "" ? word : `${line} ${word}`;
  return line === "" ? out : [...out, line];
}
function renderEntry(entry, o, source) {
  let room = Math.max(40, Math.min(o.width, 100) - 14), out = [], field = (name, text) => {
    wrap(text, room).forEach((line, n) => out.push(`  ${(n === 0 ? name : "").padEnd(12)}${line}`));
  }, commands2 = (list) => {
    for (let c of list) out.push(`${" ".repeat(14)}${paint(o, "36", `$ ${c}`)}`);
  }, safer = (name, s) => {
    field(name, s.note[o.lang]), commands2(s.run), s.back.length > 0 && (out.push(`${" ".repeat(14)}${paint(o, "2", t(o.lang, "back"))}`), commands2(s.back));
  };
  out.push(`${paint(o, COLORS[entry.verdict], `${MARKS[entry.verdict]} ${VERDICT_TEXT[entry.verdict][o.lang]}`)}  ${paint(o, "1", clean(source ?? entry.example, o.width))}`), out.push(`  ${entry.title[o.lang]}`, ""), field(t(o.lang, "lost"), entry.loses[o.lang]), entry.keeps && field(t(o.lang, "kept"), entry.keeps[o.lang]), entry.instead && safer(t(o.lang, "instead"), entry.instead), entry.before && safer(t(o.lang, "before"), entry.before);
  for (let r of entry.recover)
    field(t(o.lang, "recover"), r.gives[o.lang]), commands2(r.run), r.risk && field("", `${t(o.lang, "risk")}: ${r.risk[o.lang]}`), r.until && field("", r.until[o.lang]);
  out.push("", `  ${paint(o, "2", evidenceText(entry.evidence, o.lang))}`);
  for (let s of entry.sources) out.push(`  ${paint(o, "2", `${s.url} (${s.checked})`)}`);
  return out.join(`
`);
}
function renderAnalysis(a, o) {
  let blocks = a.findings.map((f) => renderEntry(f.entry, o, f.source)), notes = [];
  if (a.unknown.length > 0 || a.findings.length === 0) {
    let what = a.unknown.length > 0 ? a.unknown.map((u) => clean(u, 60)).join(", ") : clean(a.command, 80);
    notes.push(`${paint(o, COLORS.unknown, `${MARKS.unknown} ${VERDICT_TEXT.unknown[o.lang]}`)}  ${t(o.lang, "notKnown", { what })}`);
  }
  return a.unreadable && notes.push(t(o.lang, "unreadable")), `${[...blocks, ...notes.length > 0 ? [notes.join(`
`)] : []].join(`

`)}
`;
}
function exitCode(a) {
  let w = worst(a.findings);
  return w === "no" || w === "partly" ? 1 : w === void 0 || a.unknown.length > 0 || a.unreadable ? 3 : 0;
}
function toJson(a, lang) {
  return {
    command: a.command,
    verdict: exitCode(a) === 3 && worst(a.findings) !== "no" ? "unknown" : worst(a.findings),
    findings: a.findings.map((f) => ({ command: f.source, ...entryJson(f.entry, lang) })),
    unknown: a.unknown,
    unreadable: a.unreadable
  };
}
function entryJson(e, lang) {
  let safer = (s) => s && { note: s.note[lang], run: s.run, back: s.back };
  return {
    id: e.id,
    tool: e.tool,
    example: e.example,
    verdict: e.verdict,
    title: e.title[lang],
    loses: e.loses[lang],
    keeps: e.keeps?.[lang],
    instead: safer(e.instead),
    before: safer(e.before),
    recover: e.recover.map((r) => ({ gives: r.gives[lang], run: r.run, until: r.until?.[lang], risk: r.risk?.[lang] })),
    evidence: e.evidence,
    sources: e.sources
  };
}

// src/search.ts
var STOP = /* @__PURE__ */ new Set(["the", "my", "in", "of", "to", "and", "by", "mistake", "accident", "accidentally", "el", "la", "los", "las", "un", "una", "mi", "mis", "de", "del", "en", "por", "error", "sin", "querer", "con", "que", "se", "me", "lo", "was", "have", "has", "he", "ha", "command", "comando"]);
function stems(text) {
  return text.normalize("NFD").replace(new RegExp("\\p{M}", "gu"), "").toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 1).map((w) => w.length > 4 ? w.slice(0, 4) : w.replace(/s$/, ""));
}
function search(text, entries2, max = 5) {
  let direct = [...new Set(analyze(text, entries2).findings.map((f) => f.entry))];
  if (direct.length > 0) return direct.slice(0, max);
  let said = text.split(/\s+/).filter((w) => !STOP.has(w.toLowerCase())).join(" "), words = [...new Set(stems(said))], scored = entries2.map((entry) => {
    let title = new Set(stems(`${entry.title.en} ${entry.title.es}`)), name = new Set(stems(`${entry.id} ${entry.tool} ${entry.example}`)), rest = new Set(stems(`${entry.loses.en} ${entry.loses.es} ${entry.recover.map((r) => `${r.gives.en} ${r.gives.es}`).join(" ")}`)), score = 0;
    for (let w of words) score += (title.has(w) ? 5 : 0) + (name.has(w) ? 4 : 0) + (rest.has(w) ? 1 : 0);
    return score > 0 && entry.recover.length > 0 && (score += 0.5), { entry, score };
  }).filter((s) => s.score > 0).sort((a, b) => b.score - a.score), best = scored[0]?.score ?? 0;
  return scored.filter((s) => s.score >= best * 0.6).slice(0, max).map((s) => s.entry);
}

// src/cli.ts
var HELP = {
  en: `caniundo: can I undo this?

  caniundo "git reset --hard"     what would be lost, and how to get it back
  caniundo oops "deleted branch"  how to recover from something that already happened
  caniundo list [tool]            every command in the database

  --json              for other programs
  --lang en|es        language
  --shell powershell  read the command as PowerShell does
  --version

It never runs the command, and it never uses the network.
Exit code: 0 it can be undone, 1 not completely, 2 wrong use, 3 not known.
`,
  es: `caniundo: \xBFpuedo deshacer esto?

  caniundo "git reset --hard"    qu\xE9 se perder\xEDa y c\xF3mo recuperarlo
  caniundo oops "borr\xE9 una rama" c\xF3mo recuperarte de algo que ya pas\xF3
  caniundo list [herramienta]    todos los comandos de la base

  --json              para otros programas
  --lang en|es        idioma
  --shell powershell  lee el comando como PowerShell
  --version

Nunca ejecuta el comando y nunca usa la red.
C\xF3digo de salida: 0 se puede deshacer, 1 no del todo, 2 mal uso, 3 no se sabe.
`
};
function read(argv) {
  let f = { json: !1, lang: detectLang(), dialect: "posix", words: [], help: !1, version: !1 }, i = 0, option = (a, value) => {
    if (a === "--json") f.json = !0;
    else if (a === "--help" || a === "-h") f.help = !0;
    else if (a === "--version" || a === "-v") f.version = !0;
    else {
      if (a === "--lang")
        return isLang(value) ? f.lang = value : f.wrong = `--lang ${value ?? ""}`, 2;
      if (a === "--shell")
        return value === "powershell" || value === "posix" ? f.dialect = value : f.wrong = `--shell ${value ?? ""}`, 2;
      f.wrong = a;
    }
    return 1;
  };
  for (; i < argv.length && argv[i].startsWith("-") && argv[i] !== "--"; ) i += option(argv[i], argv[i + 1]);
  if (f.words = argv.slice(argv[i] === "--" ? i + 1 : i), f.words.length > 1 && (f.words[0].includes(" ") || f.words[0] === "list" || f.words[0] === "oops")) {
    let rest = f.words;
    f.words = [];
    for (let n = 0; n < rest.length; )
      rest[n] === "--json" || rest[n] === "--lang" || rest[n] === "--shell" ? n += option(rest[n], rest[n + 1]) : f.words.push(rest[n++]);
  }
  return f;
}
async function stdin() {
  let parts = [], size = 0;
  for await (let part of process.stdin) {
    if (size += part.length, size > 4e6) break;
    parts.push(part);
  }
  return Buffer.concat(parts).toString("utf8");
}
async function main(argv) {
  if (argv[0] === "hook")
    try {
      let reply = answer(JSON.parse(await stdin()), await entries(), hookOptions(process.env));
      return reply !== void 0 && process.stdout.write(`${JSON.stringify(reply)}
`), 0;
    } catch (e) {
      return process.stderr.write(`caniundo: ${clean(String(e.message), 200)}
`), 1;
    }
  let f = read(argv);
  if (f.version)
    return process.stdout.write(`${version()}
`), 0;
  if (f.help)
    return process.stdout.write(HELP[f.lang]), 0;
  if (f.wrong !== void 0 || f.words.length === 0)
    return process.stderr.write(HELP[f.lang]), 2;
  let all = await entries(), look = {
    lang: f.lang,
    color: process.env.NO_COLOR === void 0 && (process.stdout.isTTY === !0 || process.env.FORCE_COLOR === "1"),
    width: Math.max(60, process.stdout.columns ?? 100)
  }, [first, ...rest] = f.words;
  if (first === "list") {
    let shown = all.filter((e) => rest.length === 0 || rest.includes(e.tool));
    if (f.json)
      return process.stdout.write(`${safeJson(shown.map((e) => entryJson(e, f.lang)))}
`), 0;
    for (let e of shown) process.stdout.write(`${VERDICT_TEXT[e.verdict][f.lang].padEnd(9)} ${e.tool.padEnd(11)} ${e.example}
`);
    return process.stdout.write(`
${t(f.lang, "listCount", { n: shown.length, tested: shown.filter((e) => e.evidence.kind === "tested").length })}
`), 0;
  }
  if (first === "oops") {
    let found = search(rest.join(" "), all);
    return f.json ? (process.stdout.write(`${safeJson(found.map((e) => entryJson(e, f.lang)))}
`), found.length > 0 ? 0 : 3) : found.length === 0 ? (process.stdout.write(`${t(f.lang, "nothingFound", { what: clean(rest.join(" "), 80) })}
`), 3) : (process.stdout.write(`${t(f.lang, "oopsFirst")}

${found.map((e) => renderEntry(e, look)).join(`

`)}
`), 0);
  }
  let options = { dialect: f.dialect }, analysis = f.words.length === 1 ? analyze(first, all, options) : analyzeWords(f.words, all, options);
  return process.stdout.write(f.json ? `${safeJson(toJson(analysis, f.lang))}
` : renderAnalysis(analysis, look)), exitCode(analysis);
}
main(process.argv.slice(2)).then((code) => {
  process.exitCode = code;
}, (e) => {
  process.stderr.write(`caniundo: ${clean(String(e.message), 300)}
`), process.exitCode = 2;
});
