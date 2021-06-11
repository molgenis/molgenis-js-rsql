pipeline {
    agent {
        kubernetes {
            label 'node-erbium'
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
                    sh "yarn test:prod"
                }
            }
            post {
                always {
                    container('node') {
                        fetch_codecov()
                        sh "./codecov -c -F unit -K -C ${GIT_COMMIT}"
                    }
                }
            }
        }
        stage('Install, test and build: [ master ]') {
            when {
                allOf {
                    branch 'master'
                    not {
                        changelog '.*\\[skip ci\\]$'
                    }
                }
            }
            steps {
                milestone 1
                container('node') {
                    sh "yarn install"
                    sh "yarn test:prod"
                }
            }
            post {
                always {
                    container('node') {
                        fetch_codecov()
                        sh "./codecov -c -F unit -K -C ${GIT_COMMIT}"
                    }
                }
            }
        }
        stage('Release: [ master ]') {
            when {
                allOf {
                    branch 'master'
                    not {
                        changelog '.*\\[skip ci\\]$'
                    }
                }
            }
            environment {
                GIT_AUTHOR_EMAIL = 'molgenis+ci@gmail.com'
                GIT_AUTHOR_NAME = 'molgenis-jenkins'
                GIT_COMMITTER_EMAIL = 'molgenis+ci@gmail.com'
                GIT_COMMITTER_NAME = 'molgenis-jenkins'
            }
            steps {
                milestone 2
                container('node') {
                    sh "npm config set unsafe-perm true"
                    sh "npx semantic-release"
                }
            }
        }
    }
    post {
        failure {
            hubotSend(message: 'Build failed', status:'ERROR', site: 'slack-pr-app-team')
        }
    }
}
