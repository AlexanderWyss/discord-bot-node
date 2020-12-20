node {
    stage('Clone repository') {
        checkout scm
    }
    stage('Dependencies Server') {
        args '-u root'
        sh 'npm i'
    }
    stage('Build Server') {
        sh 'npm run build --prod'
    }
    stage('Dependencies Client') {
        dir('client') {
            sh 'npm i'
        }
    }
    stage('Build Client') {
        dir('client') {
            sh 'npm run build --prod'
        }
    }
    stage('Build image') {
        docker.build("alexanderwyss/discord-bot-node")
    }
    stage('Deploy') {
        sh 'docker stop discord-bot-node || true && docker rm -f discord-bot-node || true'
        withCredentials([string(credentialsId: 'Discord_Token', variable: 'token'), string(credentialsId: 'Discord_Owner', variable: 'owner')]) {
            sh 'docker run -d --expose 8080 --restart unless-stopped --name discord-bot-node -e NODE_ENV=production -e PORT=8080 -e TOKEN=$token -e OWNER=$owner -e URL=https://discord.wyss.tech -e PREFIX=? -e VIRTUAL_HOST=discord.wyss.tech -e VIRTUAL_PORT=8080 -e LETSENCRYPT_HOST=discord.wyss.tech alexanderwyss/discord-bot-node:latest'
        }
    }
}
