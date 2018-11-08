pipeline {
    agent {
        kubernetes {
            label 'node-carbon'
        }
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
                        env.CODECOV_TOKEN = sh(script: 'vault read -field=molgenis-js-rsql secret/ops/token/codecov', returnStdout: true)
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
                REPOSITORY = 'molgenis/molgenis-js-rsql'
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
                    sh "git remote set-url origin https://${GITHUB_TOKEN}@github.com/${REPOSITORY}.git"

                    sh "git checkout -f ${BRANCH_NAME}"

                    sh "npm config set unsafe-perm true"
                    sh "npm version ${RELEASE_SCOPE} -m '[ci skip] [npm-version] %s'"

                    sh "git push --tags origin ${BRANCH_NAME}"

                    sh "echo //${NPM_REGISTRY}/:_authToken=${NPM_TOKEN} > ~/.npmrc"

                    sh "npm publish"
                }
            }
        }
    }
    post {
        success {
            notifySuccess()
        }
        failure {
            notifyFailed()
        }
    }
}

def notifySuccess() {
    hubotSend(message: 'Build success', status:'INFO', site: 'slack-pr-app-team')
}

def notifyFailed() {
    hubotSend(message: 'Build failed', status:'ERROR', site: 'slack-pr-app-team')
}
}
