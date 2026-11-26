# Cloud and infrastructure

Generated from `entries/` in https://github.com/willor16/caniundo. Do not edit by hand.

- `aws dynamodb delete-table --table-name orders`: PARTLY
- `aws ec2 terminate-instances --instance-ids i-0abc`: NO
- `aws kms schedule-key-deletion --key-id 1234`: YES
- `aws rds delete-db-instance --db-instance-identifier shop --skip-final-snapshot`: NO
- `aws rds delete-db-instance --db-instance-identifier shop --final-db-snapshot-identifier shop-last`: PARTLY
- `aws s3 rb s3://shop-photos --force`: NO
- `aws s3 rm s3://shop-photos --recursive`: PARTLY
- `aws secretsmanager delete-secret --secret-id shop-key --force-delete-without-recovery`: NO
- `aws secretsmanager delete-secret --secret-id shop-key`: YES
- `az group delete --name shop`: NO
- `fly volumes destroy vol_123`: PARTLY
- `gcloud projects delete my-shop`: PARTLY
- `gcloud sql instances delete shop`: NO
- `gh repo delete owner/repo`: PARTLY
- `heroku apps:destroy --app shop`: NO
- `heroku pg:reset --app shop`: NO
- `railway volume delete`: PARTLY
- `supabase db reset`: NO
- `terraform destroy`: PARTLY
- `terraform state rm aws_instance.web`: YES
- `vercel remove my-shop`: PARTLY

## aws dynamodb delete-table --table-name orders

**PARTLY** · Delete a DynamoDB table · id `aws-dynamodb-delete`

- **Matches:** `aws dynamodb delete-table`
- **Lost:** The table, if point-in-time recovery was off and there is no backup.
- **Kept:** With that recovery on, a copy that AWS makes when the table is deleted.
- **To undo:** The table. Its alarms, policies and tags have to be set up again.

    ```sh
    aws dynamodb restore-table-from-backup --target-table-name <table> --backup-arn <backup>
    ```
  - Until: 35 days, for the copy that AWS makes.
- **Evidence:** Documented, not tested
- **Source:** https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/PointInTimeRecovery_Howitworks.html (checked 2026-11-25)
- **Source:** https://docs.aws.amazon.com/cli/latest/reference/dynamodb/restore-table-from-backup.html (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/aws-dynamodb-delete/ (Spanish: https://willor16.github.io/caniundo/es/c/aws-dynamodb-delete/)

## aws ec2 terminate-instances --instance-ids i-0abc

**NO** · Delete an EC2 server · id `aws-ec2-terminate`

- **Matches:** `aws ec2 terminate-instances`, not with `--dry-run`
- **Lost:** The server and its main disk. Other disks created with it from the command line too, unless DeleteOnTermination is off.
- **Instead:** Stop it. That still erases instance store disks.

    ```sh
    aws ec2 stop-instances --instance-ids <instance>
    ```

  To go back:

    ```sh
    aws ec2 start-instances --instance-ids <instance>
    ```
- **Evidence:** Documented, not tested
- **Source:** https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/terminating-instances.html (checked 2026-11-25)
- **Source:** https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/preserving-volumes-on-termination.html (checked 2026-11-25)
- **Source:** https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Stop_Start.html (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/aws-ec2-terminate/ (Spanish: https://willor16.github.io/caniundo/es/c/aws-ec2-terminate/)

## aws kms schedule-key-deletion --key-id 1234

**YES** · Schedule the deletion of an encryption key · id `aws-kms-delete`

- **Matches:** `aws kms schedule-key-deletion`
- **Lost:** Nothing until the date. After that, what was encrypted with the key cannot be read.
- **To undo:** The key. It stays disabled until the second command.

    ```sh
    aws kms cancel-key-deletion --key-id <key>
    aws kms enable-key --key-id <key>
    ```
  - Until: Until the waiting period ends, from 7 to 30 days.
- **Evidence:** Documented, not tested
- **Source:** https://docs.aws.amazon.com/kms/latest/developerguide/deleting-keys.html (checked 2026-11-25)
- **Source:** https://docs.aws.amazon.com/cli/latest/reference/kms/cancel-key-deletion.html (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/aws-kms-delete/ (Spanish: https://willor16.github.io/caniundo/es/c/aws-kms-delete/)

## aws rds delete-db-instance --db-instance-identifier shop --skip-final-snapshot

**NO** · Delete a database in RDS without a last copy · id `aws-rds-delete-no-snapshot`

- **Matches:** `aws rds delete-db-instance`, with `--skip-final-snapshot`; or `aws rds delete-db-cluster`, with `--skip-final-snapshot`
- **More specific than:** `aws rds delete-db-instance --db-instance-identifier shop --final-db-snapshot-identifier shop-last`
- **Lost:** The data since the last manual snapshot, or all of it if there is none. Automated backups too, unless you choose to keep them.
- **Kept:** Manual snapshots. AWS Support may be able to help within six days.
- **Instead:** Use --final-db-snapshot-identifier, so that a last copy stays.
- **Evidence:** Documented, not tested
- **Source:** https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_DeleteInstance.html (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/aws-rds-delete-no-snapshot/ (Spanish: https://willor16.github.io/caniundo/es/c/aws-rds-delete-no-snapshot/)

## aws rds delete-db-instance --db-instance-identifier shop --final-db-snapshot-identifier shop-last

**PARTLY** · Delete a database in RDS · id `aws-rds-delete`

- **Matches:** `aws rds delete-db-instance`; or `aws rds delete-db-cluster`
- **Lost:** The server and its address. Automated backups too, unless you choose to keep them.
- **Kept:** The final snapshot and the manual ones.
- **To undo:** A new database with the data of the snapshot.

    ```sh
    aws rds restore-db-instance-from-db-snapshot --db-instance-identifier <new-name> --db-snapshot-identifier <snapshot>
    ```
- **Evidence:** Documented, not tested
- **Source:** https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_DeleteInstance.html (checked 2026-11-25)
- **Source:** https://docs.aws.amazon.com/cli/latest/reference/rds/restore-db-instance-from-db-snapshot.html (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/aws-rds-delete/ (Spanish: https://willor16.github.io/caniundo/es/c/aws-rds-delete/)

## aws s3 rb s3://shop-photos --force

**NO** · Delete an S3 bucket · id `aws-s3-bucket-delete`

- **Matches:** `aws s3 rb`; or `aws s3api delete-bucket`
- **Lost:** The bucket, and with --force its objects. Another account can take its name.
- **Evidence:** Documented, not tested
- **Source:** https://docs.aws.amazon.com/AmazonS3/latest/userguide/delete-bucket.html (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/aws-s3-bucket-delete/ (Spanish: https://willor16.github.io/caniundo/es/c/aws-s3-bucket-delete/)

## aws s3 rm s3://shop-photos --recursive

**PARTLY** · Delete objects from S3 · id `aws-s3-delete`

- **Matches:** `aws s3 rm`, not with `--dryrun`; or `aws s3 sync`, with `--delete`, not with `--dryrun`; or `aws s3api delete-object`; or `aws s3api delete-objects`
- **Lost:** The objects, forever, if the bucket has no versioning.
- **Kept:** The old versions, if versioning was on before.
- **Instead:** Add --dryrun to see the list.
- **To undo:** With versioning on: each object, by deleting its delete marker. The first command lists them.

    ```sh
    aws s3api list-object-versions --bucket <bucket> --prefix <key>
    aws s3api delete-object --bucket <bucket> --key <key> --version-id <delete-marker>
    ```
  - Careful: Deleting a version that is not the marker is permanent.
- **Evidence:** Documented, not tested
- **Source:** https://docs.aws.amazon.com/AmazonS3/latest/userguide/DeletingObjects.html (checked 2026-11-25)
- **Source:** https://docs.aws.amazon.com/AmazonS3/latest/userguide/DeleteMarker.html (checked 2026-11-25)
- **Source:** https://docs.aws.amazon.com/cli/latest/reference/s3/rm.html (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/aws-s3-delete/ (Spanish: https://willor16.github.io/caniundo/es/c/aws-s3-delete/)

## aws secretsmanager delete-secret --secret-id shop-key --force-delete-without-recovery

**NO** · Delete a secret right now · id `aws-secret-delete-force`

- **Matches:** `aws secretsmanager delete-secret`, with `--force-delete-without-recovery`
- **Lost:** The secret, forever.
- **Instead:** Without --force-delete-without-recovery there are at least 7 days to change your mind.
- **Evidence:** Documented, not tested
- **Source:** https://docs.aws.amazon.com/cli/latest/reference/secretsmanager/delete-secret.html (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/aws-secret-delete-force/ (Spanish: https://willor16.github.io/caniundo/es/c/aws-secret-delete-force/)

## aws secretsmanager delete-secret --secret-id shop-key

**YES** · Delete a secret · id `aws-secret-delete`

- **Matches:** `aws secretsmanager delete-secret`, not with `--force-delete-without-recovery`
- **Lost:** Access to the secret, right away. Programs that need it stop working.
- **To undo:** The secret.

    ```sh
    aws secretsmanager restore-secret --secret-id <secret>
    ```
  - Until: Until the waiting period ends, from 7 to 30 days.
- **Evidence:** Documented, not tested
- **Source:** https://docs.aws.amazon.com/cli/latest/reference/secretsmanager/delete-secret.html (checked 2026-11-25)
- **Source:** https://docs.aws.amazon.com/cli/latest/reference/secretsmanager/restore-secret.html (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/aws-secret-delete/ (Spanish: https://willor16.github.io/caniundo/es/c/aws-secret-delete/)

## az group delete --name shop

**NO** · Delete a resource group in Azure · id `az-group-delete`

- **Matches:** `az group delete`
- **Lost:** The group and everything in it.
- **Kept:** Some resources with soft delete, such as key vaults or blobs, if it was set up before.
- **Instead:** See what it has: az resource list --resource-group <name>
- **Evidence:** Documented, not tested
- **Source:** https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/delete-resource-group (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/az-group-delete/ (Spanish: https://willor16.github.io/caniundo/es/c/az-group-delete/)

## fly volumes destroy vol_123

**PARTLY** · Delete a Fly.io volume · id `fly-volume-destroy`

- **Matches:** `fly volumes destroy`; or `flyctl volumes destroy`; or `fly volume destroy`; or `fly vol destroy`
- **Lost:** The data since the last snapshot.
- **To undo:** A new volume with the last snapshot. It needs the ID of the deleted one, which can be listed for 24 hours.

    ```sh
    fly volumes list --all
    fly volumes snapshots list <volume>
    fly volumes create <name> --snapshot-id <snapshot> -s <size>
    ```
  - Until: 5 days by default.
- **Evidence:** Documented, not tested
- **Source:** https://docs.fly.io/volumes/snapshots (checked 2026-11-25)
- **Source:** https://docs.fly.io/flyctl/cmd/fly_volumes_destroy (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/fly-volume-destroy/ (Spanish: https://willor16.github.io/caniundo/es/c/fly-volume-destroy/)

## gcloud projects delete my-shop

**PARTLY** · Delete a Google Cloud project · id `gcloud-project-delete`

- **Matches:** `gcloud projects delete`
- **Lost:** Some data may go before the 30 days, such as Cloud Storage buckets without soft delete. Billing has to be turned on again.
- **To undo:** The project.

    ```sh
    gcloud projects undelete <project>
    ```
  - Until: 30 days.
- **Evidence:** Documented, not tested
- **Source:** https://docs.cloud.google.com/resource-manager/docs/delete-restore-projects (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/gcloud-project-delete/ (Spanish: https://willor16.github.io/caniundo/es/c/gcloud-project-delete/)

## gcloud sql instances delete shop

**NO** · Delete a Cloud SQL server · id `gcloud-sql-delete`

- **Matches:** `gcloud sql instances delete`
- **Lost:** All the data and its backups, also the ones made on demand.
- **Kept:** A final backup, only if you ask for one. Otherwise, Google may be able to help within 4 days.
- **Instead:** Add --enable-final-backup, so that a last copy stays.
- **Evidence:** Documented, not tested
- **Source:** https://docs.cloud.google.com/sql/docs/mysql/delete-instance (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/gcloud-sql-delete/ (Spanish: https://willor16.github.io/caniundo/es/c/gcloud-sql-delete/)

## gh repo delete owner/repo

**PARTLY** · Delete a GitHub repository · id `gh-repo-delete`

- **Matches:** `gh repo delete`
- **Lost:** Team permissions. If it has forks, maybe the whole repository.
- **To undo:** The repository, on github.com: Settings, Repositories, Deleted repositories.
  - Until: 90 days. It can take an hour to appear.
- **Evidence:** Documented, not tested
- **Source:** https://docs.github.com/en/repositories/creating-and-managing-repositories/restoring-a-deleted-repository (checked 2026-11-25)
- **Source:** https://cli.github.com/manual/gh_repo_delete (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/gh-repo-delete/ (Spanish: https://willor16.github.io/caniundo/es/c/gh-repo-delete/)

## heroku apps:destroy --app shop

**NO** · Delete a Heroku app · id `heroku-apps-destroy`

- **Matches:** `heroku apps:destroy`; or `heroku apps:delete`; or `heroku addons:destroy`
- **Lost:** The app or the add-on. Heroku describes it as permanent.
- **Evidence:** Documented, not tested
- **Source:** https://devcenter.heroku.com/articles/heroku-cli-commands (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/heroku-apps-destroy/ (Spanish: https://willor16.github.io/caniundo/es/c/heroku-apps-destroy/)

## heroku pg:reset --app shop

**NO** · Empty a Heroku database · id `heroku-pg-reset`

- **Matches:** `heroku pg:reset`
- **Lost:** All the data in the database.
- **Before:** Make a copy: heroku pg:backups:capture
- **Evidence:** Documented, not tested
- **Source:** https://devcenter.heroku.com/articles/heroku-cli-commands (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/heroku-pg-reset/ (Spanish: https://willor16.github.io/caniundo/es/c/heroku-pg-reset/)

## railway volume delete

**PARTLY** · Delete a Railway volume · id `railway-volume-delete`

- **Matches:** `railway volume delete`; or `railway volume remove`; or `railway volume rm`
- **Lost:** Everything in the volume, when the time is up.
- **To undo:** The volume, with the link in the email that Railway sends.
  - Until: 48 hours.
- **Evidence:** Documented, not tested
- **Source:** https://docs.railway.com/volumes/reference (checked 2026-11-25)
- **Source:** https://docs.railway.com/volumes/backups (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/railway-volume-delete/ (Spanish: https://willor16.github.io/caniundo/es/c/railway-volume-delete/)

## supabase db reset

**NO** · Create a Supabase database again · id `supabase-db-reset`

- **Matches:** `supabase db reset`
- **Lost:** All the data that is not in a migration or in the seed file. With --remote or --linked, in the real database.
- **Before:** Make a copy with supabase db dump, and check which database it points to.
- **Evidence:** Documented, not tested
- **Source:** https://supabase.com/docs/reference/cli/supabase-db-reset (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/supabase-db-reset/ (Spanish: https://willor16.github.io/caniundo/es/c/supabase-db-reset/)

## terraform destroy

**PARTLY** · Delete all the infrastructure · id `terraform-destroy`

- **Matches:** `terraform destroy`; or `tofu destroy`; or `terraform apply`, with `-destroy` or `--destroy`; or `tofu apply`, with `-destroy` or `--destroy`
- **Lost:** The data in it, such as databases, disks and buckets.
- **Kept:** The configuration. It creates the same things again, but empty.
- **Instead:** See what it would delete: terraform plan -destroy
- **To undo:** The same infrastructure, new and empty.

    ```sh
    terraform apply
    ```
- **Evidence:** Documented, not tested
- **Source:** https://developer.hashicorp.com/terraform/cli/commands/destroy (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/terraform-destroy/ (Spanish: https://willor16.github.io/caniundo/es/c/terraform-destroy/)

## terraform state rm aws_instance.web

**YES** · Make Terraform forget something · id `terraform-state-rm`

- **Matches:** `terraform state rm`, not with `-dry-run`, `--dry-run`; or `tofu state rm`, not with `-dry-run`, `--dry-run`
- **Lost:** Only the link. The real thing keeps running, and the next plan would create another one.
- **To undo:** The link.

    ```sh
    terraform import <address> <id>
    ```
- **Evidence:** Documented, not tested
- **Source:** https://developer.hashicorp.com/terraform/cli/commands/state/rm (checked 2026-11-25)
- **Source:** https://developer.hashicorp.com/terraform/cli/commands/import (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/terraform-state-rm/ (Spanish: https://willor16.github.io/caniundo/es/c/terraform-state-rm/)

## vercel remove my-shop

**PARTLY** · Delete a Vercel deployment or project · id `vercel-remove`

- **Matches:** `vercel remove`; or `vercel rm`
- **Lost:** The deployment. With the name of a project, the project and all of them.
- **Instead:** --safe leaves alone the ones that are in use.
- **To undo:** A deployment, on vercel.com: project Settings, Security, Recently Deleted. Vercel does not say the same of a whole project.
  - Until: From 1 to 30 days, depending on its age.
- **Evidence:** Documented, not tested
- **Source:** https://vercel.com/docs/cli/remove (checked 2026-11-25)
- **Source:** https://vercel.com/docs/deployment-retention (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/vercel-remove/ (Spanish: https://willor16.github.io/caniundo/es/c/vercel-remove/)
