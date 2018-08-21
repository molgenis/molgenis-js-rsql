pipeline {
    agent {
        kubernetes {
            label 'node-carbon'
        }
    }
    environment {
        npm_config_registry = 'http://nexus.molgenis-nexus:8081/repository/npm-central/'
    }
    stages {
        stage('Prepare') {
            steps {
                script {
                    env.GIT_COMMIT = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
                }
                container('vault') {
                    script {
                        env.GITHUB_TOKEN = sh(script: 'vault read -field=value secret/ops/token/github', returnStdout: true)
                        env.CODECOV_TOKEN = sh(script: 'vault read -field=value secret/ops/token/codecov', returnStdout: true)
                        env.NPM_TOKEN = sh(script: 'vault read -field=value secret/ops/token/npm', returnStdout: true)
                    }
                }
            }
        }
        stage('Install and test: [ pull request ]') {
            when {
                changeRequest()
            }
            steps {
                container('node') {
                    sh "yarn install"
                    sh "yarn unit"
                }
            }
            post {
                always {
                    container('node') {
                        sh "curl -s https://codecov.io/bash | bash -s - -c -F unit -K"
                    }
                }
            }
        }
        stage('Install, test and build: [ master ]') {
            when {
                branch 'master'
            }
            steps {
                milestone 1
                container('node') {
                    sh "yarn install"
                    sh "yarn unit"
                }
            }
            post {
                always {
                    container('node') {
                        sh "curl -s https://codecov.io/bash | bash -s - -c -F unit -K"
                    }
                }
            }
        }
        stage('Release: [ master ]') {
            when {
                branch 'master'
            }
            environment {
                ORG = 'molgenis'
                REPO_NAME = 'molgenis-js-rsql'
                REGISTRY = 'registry.npmjs.org'
            }
            steps {
                timeout(time: 30, unit: 'MINUTES') {
                    script {
                        env.RELEASE_SCOPE = input(
                                message: 'Do you want to release?',
                                ok: 'Release',
                                parameters: [
                                        choice(choices: 'patch\nminor\nmajor', description: '', name: 'RELEASE_SCOPE')
                                ]
                        )
                    }
                }
                milestone 2
                container('node') {
                    sh "git config --global user.email molgenis+ci@gmail.com"
                    sh "git config --global user.name molgenis-jenkins"
                    sh "git remote set-url origin https://${GITHUB_TOKEN}@github.com/${ORG}/${REPO_NAME}.git"

                    sh "git checkout -f ${BRANCH_NAME}"

                    sh "npm config set unsafe-perm true"
                    sh "npm version ${RELEASE_SCOPE} -m '[ci skip] [npm-version] %s'"

                    sh "git push --tags origin ${BRANCH_NAME}"

                    sh "echo //${REGISTRY}/:_authToken=${NPM_TOKEN} > ~/.npmrc"

                    sh "npm publish"
                }
            }
        }
    }
}
