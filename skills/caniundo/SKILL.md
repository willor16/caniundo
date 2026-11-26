---
name: caniundo
description: "Says whether a command can be undone, what it would destroy, a safer way to do it and how to recover afterwards, from an open database of destructive commands with tested recipes. Use it whenever someone is about to run, or has already run, something that deletes, overwrites, resets, force-pushes, drops, prunes or truncates: git (reset --hard, clean, push --force, stash drop, branch -D, checkout, restore), rm and other file commands, PowerShell, SQL (DROP, TRUNCATE, DELETE, UPDATE without WHERE), Docker, Kubernetes, Helm, Terraform, AWS, Google Cloud, Azure, GitHub, Railway, Heroku, Fly.io, Supabase, Vercel, npm, Cargo or PyPI. Also use it when someone lost work, deleted something by mistake, wants to recover data, or asks \"can I undo this\", in any language."
license: MIT
---

# Can I undo this?

Recovery depends on details that are easy to get wrong from memory: which flag deletes the volumes, how many days a reflog keeps a commit, whether a backup lives inside the thing that was deleted. Each entry in `references/` says what a command loses, a safer way, and recipes to get things back, and most recipes were run in a test where everything came back. Answer from the entry, not from memory, because a confident wrong answer here costs someone their data.

The database has 99 commands, 51 of them tested.

## Find the entry

1. Look the command up in the index below, then read its section in the reference file. Each entry lists under **Matches** the forms it covers.
2. Look through wrappers: `sudo`, `bash -c`, `docker exec`, `kubectl exec`, `ssh`, `xargs`, `find -exec`, `psql -c`. A line with several commands can match several entries; answer for each.
3. When two entries fit, the one marked **More specific than** the other wins.
4. When nothing fits, say that it is not in the database and that this does not mean it is safe. You can still reason from what you know, but say that it was not checked.

## Before a command runs

Give the verdict first, then what is lost, the safer way, and how to undo it, with the evidence. Keep it short: the person is deciding whether to press enter.

If you are the one about to run a command marked NO or PARTLY, stop and ask first, and prefer the safer way. Everyday commands (they say so) do not need a warning unless what they would lose matters here.

## After something was lost

1. **Stop everything that writes.** Deleted data often survives until something overwrites it or a cleanup runs: `git gc`, a restart, a reinstall, a new deploy. Ask the person to wait too.
2. Find the entry, and the recipe that fits what was lost. Check its **Until**: some windows are hours.
3. See what is still there with commands that only read, such as `git reflog`, `git fsck --lost-found`, `git stash list` or `docker volume ls`.
4. Show the recipe with what it brings back, its time limit and its **Careful** note. Fill each `<placeholder>` with a real value that you found, never a guess. Run it only after the person agrees.
5. Check the result, and say plainly what did not come back.

## Reading an entry

- **YES**: it all comes back with the recipe, usually for a limited time. **PARTLY**: some of it. **NO**: nothing comes back unless there was a copy.
- **Evidence**: "Tested" means the command and every recipe were run in an automated test, with the versions listed. "Documented" means that only the official documentation says so. Say which, because it changes how much to trust it.
- The references are in English. Answer in the language of the person, and link the page of the entry for more: there is one in Spanish too.
- If the person's version is much older or newer than the tested one, or the entry looks wrong, say so, and point to https://github.com/willor16/caniundo to fix it.

## Index

| Command | Verdict | File |
| --- | --- | --- |
| `git merge --abort` | NO | git.md |
| `git branch -D feature` | YES | git.md |
| `git branch -f feature main` | YES | git.md |
| `git checkout -- src/app.js` | NO | git.md |
| `git checkout -f main` | NO | git.md |
| `git cherry-pick a1b2c3d` | YES | git.md |
| `git clean -fd` | NO | git.md |
| `git commit --amend` | YES | git.md |
| `git commit -m "message"` | YES | git.md |
| `git filter-branch --tree-filter "rm -f secret.txt" HEAD` | YES | git.md |
| `git filter-repo --path secret.txt --invert-paths` | NO | git.md |
| `git merge feature` | YES | git.md |
| `git gc --prune=now` | NO | git.md |
| `git push origin --delete feature` | PARTLY | git.md |
| `git push --force` | PARTLY | git.md |
| `git push --force-with-lease` | YES | git.md |
| `git rebase main` | YES | git.md |
| `git reset --hard HEAD~1` | PARTLY | git.md |
| `git restore src/app.js` | NO | git.md |
| `git rm -f old.txt` | PARTLY | git.md |
| `git rm old.txt` | YES | git.md |
| `git stash clear` | YES | git.md |
| `git stash drop` | YES | git.md |
| `git tag -d v1.0` | YES | git.md |
| `git restore --staged src/app.js` | PARTLY | git.md |
| `git worktree remove ../feature` | PARTLY | git.md |
| `cp new.txt old.txt` | NO | files.md |
| `dd if=image.iso of=/dev/sdb` | NO | files.md |
| `find . -name "*.log" -delete` | NO | files.md |
| `mv draft.txt final.txt` | PARTLY | files.md |
| `echo hello > notes.txt` | NO | files.md |
| `rm -rf dist` | PARTLY | files.md |
| `rm -rf .git` | NO | files.md |
| `rm -rf __pycache__` | YES | files.md |
| `rm -rf /tmp/build-1234` | NO | files.md |
| `rm -rf folder` | NO | files.md |
| `rsync -a --delete source/ backup/` | NO | files.md |
| `sed -i "s/old/new/g" config.txt` | NO | files.md |
| `shred -u secret.txt` | NO | files.md |
| `truncate -s 0 app.log` | NO | files.md |
| `rm -rf node_modules` | YES | files.md |
| `crontab -r` | PARTLY | files.md |
| `mkfs.ext4 /dev/sdb1` | NO | files.md |
| `Clear-Content app.log` | NO | files.md |
| `Clear-RecycleBin -Force` | NO | files.md |
| `cmd /c "rd /s /q folder"` | NO | files.md |
| `Remove-Item -Recurse folder` | NO | files.md |
| `Set-Content notes.txt hello` | NO | files.md |
| `mongosh --eval "db.dropDatabase()"` | NO | databases.md |
| `mysql -e "DROP TABLE users" shop` | NO | databases.md |
| `mysql -e "DELETE FROM users" shop` | NO | databases.md |
| `psql -c "DELETE FROM users"` | NO | databases.md |
| `psql -c "ALTER TABLE users DROP COLUMN email"` | NO | databases.md |
| `psql -c "DROP DATABASE shop"` | NO | databases.md |
| `psql -c "DROP SCHEMA public CASCADE"` | NO | databases.md |
| `psql -c "DROP TABLE users"` | NO | databases.md |
| `psql -c "TRUNCATE users"` | NO | databases.md |
| `psql -c "UPDATE users SET active = false"` | NO | databases.md |
| `redis-cli FLUSHALL` | PARTLY | databases.md |
| `sqlite3 app.db "DELETE FROM users"` | NO | databases.md |
| `sqlite3 app.db "DROP TABLE users"` | NO | databases.md |
| `sqlite3 app.db "UPDATE users SET active = 0"` | NO | databases.md |
| `docker compose down -v` | NO | containers.md |
| `docker compose down` | PARTLY | containers.md |
| `docker rm -f db` | NO | containers.md |
| `docker rmi shop:1.0` | PARTLY | containers.md |
| `docker system prune` | PARTLY | containers.md |
| `docker volume prune` | NO | containers.md |
| `docker volume rm shop_data` | NO | containers.md |
| `helm uninstall shop` | PARTLY | containers.md |
| `kubectl delete namespace shop` | NO | containers.md |
| `kubectl delete pvc shop-data` | NO | containers.md |
| `kubectl delete deployment shop` | PARTLY | containers.md |
| `aws dynamodb delete-table --table-name orders` | PARTLY | cloud.md |
| `aws ec2 terminate-instances --instance-ids i-0abc` | NO | cloud.md |
| `aws kms schedule-key-deletion --key-id 1234` | YES | cloud.md |
| `aws rds delete-db-instance --db-instance-identifier shop --skip-final-snapshot` | NO | cloud.md |
| `aws rds delete-db-instance --db-instance-identifier shop --final-db-snapshot-identifier shop-last` | PARTLY | cloud.md |
| `aws s3 rb s3://shop-photos --force` | NO | cloud.md |
| `aws s3 rm s3://shop-photos --recursive` | PARTLY | cloud.md |
| `aws secretsmanager delete-secret --secret-id shop-key --force-delete-without-recovery` | NO | cloud.md |
| `aws secretsmanager delete-secret --secret-id shop-key` | YES | cloud.md |
| `az group delete --name shop` | NO | cloud.md |
| `fly volumes destroy vol_123` | PARTLY | cloud.md |
| `gcloud projects delete my-shop` | PARTLY | cloud.md |
| `gcloud sql instances delete shop` | NO | cloud.md |
| `gh repo delete owner/repo` | PARTLY | cloud.md |
| `heroku apps:destroy --app shop` | NO | cloud.md |
| `heroku pg:reset --app shop` | NO | cloud.md |
| `railway volume delete` | PARTLY | cloud.md |
| `supabase db reset` | NO | cloud.md |
| `terraform destroy` | PARTLY | cloud.md |
| `terraform state rm aws_instance.web` | YES | cloud.md |
| `vercel remove my-shop` | PARTLY | cloud.md |
| `cargo publish` | NO | packages.md |
| `cargo yank --version 1.0.0 my-crate` | YES | packages.md |
| `npm publish` | PARTLY | packages.md |
| `npm unpublish my-package@1.0.0` | NO | packages.md |
| `twine upload dist/*` | NO | packages.md |
