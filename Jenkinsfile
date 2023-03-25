pipeline {
    agent any
    stages {
        stage('Dependencies Server') {
            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'npm ci'
            }
        }
        stage('Build Server') {
            steps {
                sh 'npm run build'
            }
        }
        stage('Dependencies Client') {
            steps {
                dir('client') {
                    sh 'npm ci'
                }
            }
        }
        stage('Build Client') {
            steps {
                dir('client') {
                    sh 'npm run build:prod'
                }
            }
        }
        stage('Archive client artifact') {
            steps {
                script {
                    sh 'rm client.zip || true'
                    zip zipFile: 'client.zip', dir: 'dist/client'
                    archiveArtifacts artifacts: 'client.zip'
                }
            }
        }
        stage('Build and publish docker image') {
            steps {
                script {
                    def dockerImage = docker.build("alexanderwyss/discord-bot-node", "-f DockerfileJenkins .")
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                        dockerImage.push(BUILD_NUMBER)
                        dockerImage.push("latest")
                    }
                }
            }
        }
        stage('Deploy') {
            steps {
                sh 'docker stop discord-bot-node || true && docker rm -f discord-bot-node || true'
                withCredentials([string(credentialsId: 'Discord_Token', variable: 'token'), string(credentialsId: 'Discord_Owner', variable: 'owner')]) {
                    sh 'docker run -d --expose 8080 --restart unless-stopped --name discord-bot-node -e NODE_ENV=production -e PORT=8080 -e TOKEN=$token -e OWNER=$owner -e URL=https://discord.wyss.tech -e PREFIX=? -e VIRTUAL_HOST=discord.wyss.tech -e VIRTUAL_PORT=8080 -e LETSENCRYPT_HOST=discord.wyss.tech alexanderwyss/discord-bot-node:latest'
                }
                sh 'docker stop discord-bot-node-demo || true && docker rm -f discord-bot-node-demo || true'
                withCredentials([string(credentialsId: 'Discord_Token_Demo', variable: 'token'), string(credentialsId: 'Discord_Owner', variable: 'owner')]) {
                    sh 'docker run -d --expose 8080 --restart unless-stopped --name discord-bot-node-demo -e NODE_ENV=production -e PORT=8080 -e TOKEN=$token -e OWNER=$owner -e URL=https://discord-demo.wyss.tech -e PREFIX=! -e VIRTUAL_HOST=discord-demo.wyss.tech -e VIRTUAL_PORT=8080 -e LETSENCRYPT_HOST=discord-demo.wyss.tech alexanderwyss/discord-bot-node:latest'
                }
            }
        }
    }
}
