# Changelog

## [0.2.0](https://github.com/DamienReichhart/template-fullstack-typescript-production/compare/v0.1.0...v0.2.0) (2026-10-30)


### Features

* **api,worker:** serve videos and transcode them in the worker ([69bcc0d](https://github.com/DamienReichhart/template-fullstack-typescript-production/commit/69bcc0dad699605231f2e581a58d5055343a69c9))
* **api:** report the product version from the root package.json ([43ad4e4](https://github.com/DamienReichhart/template-fullstack-typescript-production/commit/43ad4e41774493a1bb1943d99e95ce77e9e08447))
* **database:** check that migrations match the Prisma schema ([d6b1785](https://github.com/DamienReichhart/template-fullstack-typescript-production/commit/d6b1785aba16ed5b86f9db7dd2fa3c257f6e1e1b))
* **media:** transcode uploaded videos into one visually lossless H.264 file ([31c8da7](https://github.com/DamienReichhart/template-fullstack-typescript-production/commit/31c8da713b7147cec0549ad2d109211fd1294d00))
* **messaging:** let a processor fix its own concurrency ([bcdffbc](https://github.com/DamienReichhart/template-fullstack-typescript-production/commit/bcdffbc70612559f9ead5207a5cc6eb28ce22762))
* **storage:** recognise MP4 and QuickTime file signatures ([d5a5f91](https://github.com/DamienReichhart/template-fullstack-typescript-production/commit/d5a5f91724b9ccbb98cdead896decf8322cb767f))
* **web:** let users upload videos and play them once converted ([5d6f178](https://github.com/DamienReichhart/template-fullstack-typescript-production/commit/5d6f178c4e4b2606421794e60a2fa3438be35e56))


### Bug Fixes

* **api:** regenerate the OpenAPI document for the video endpoints ([bca94aa](https://github.com/DamienReichhart/template-fullstack-typescript-production/commit/bca94aa69cc692ec025e0801dbb12916b4533f79))
* **deps:** patch the vulnerabilities the image scan blocks on ([214fee8](https://github.com/DamienReichhart/template-fullstack-typescript-production/commit/214fee8806f270ae2f87dece14ee973199bc98f9))
* **docker:** move nginx to 1.31.8 for the critical CVEs the image scan blocks on ([681010d](https://github.com/DamienReichhart/template-fullstack-typescript-production/commit/681010d856e3ea090b17230fa75ae5b16f9a5419))
* **docker:** move the worker's ffmpeg to 9.0.2 for the critical CVE the scan blocks on ([ea47976](https://github.com/DamienReichhart/template-fullstack-typescript-production/commit/ea47976493a646233a15f771b582a1c1c5a89ef7))
* **repo:** migrate the database and provision the bucket before every e2e suite ([1b87136](https://github.com/DamienReichhart/template-fullstack-typescript-production/commit/1b87136e2b99e4849faba3451eb47ec5cf82a779))
* **repo:** read the skills lock file without checking it exists first ([eafed79](https://github.com/DamienReichhart/template-fullstack-typescript-production/commit/eafed792add522c564e0ee461e2871808eb3100c))
* trim trailing slashes from base URLs in linear time ([ff9864d](https://github.com/DamienReichhart/template-fullstack-typescript-production/commit/ff9864d15a4c4f870dedb2c5f26ed2837197d114))


### Refactoring

* **http:** read the caller and the verified-email rule from @template/http ([ed417c6](https://github.com/DamienReichhart/template-fullstack-typescript-production/commit/ed417c6f7f2e310e69c19a707a59b8706b172009))
