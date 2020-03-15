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
        TOKEN = credentials('Discord_Token')
        OWNER = credentials('Discord_Owner')
        sh "docker run -d -p 8083:8080 --restart unless-stopped --name discord-bot -e PORT=8080 -e TOKEN=$TOKEN -e OWNER=$OWNER alexanderwyss/discord-bot-node:latest"
    }
}
