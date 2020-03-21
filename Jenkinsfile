node {
    def dockerImage
    stage('Clone repository') {
        checkout scm
    }
    stage('Build image') {
        dockerImage = docker.build("alexanderwyss/discord-bot-node")
    }
    stage('Push image') {
        String version = "1";
        docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
            dockerImage.push(version)
            dockerImage.push("latest")
        }
    }
    stage('Deploy') {
        sh 'docker pull alexanderwyss/discord-bot-node:latest'
        sh 'docker stop discord-bot-node || true && docker rm -f discord-bot-node || true'
        withCredentials([string(credentialsId: 'Discord_Token', variable: 'token'), string(credentialsId: 'Discord_Owner', variable: 'owner')]) {
            sh 'docker run -d --expose 8080 --restart unless-stopped --name discord-bot-node -e NODE_ENV=production -e PORT=8080 -e TOKEN=$token -e OWNER=$owner -e VIRTUAL_HOST=discord.wyss.tech -e VIRTUAL_PORT=8080 -e LETSENCRYPT_HOST=discord.wyss.tech alexanderwyss/discord-bot-node:latest'
        }
    }
}
