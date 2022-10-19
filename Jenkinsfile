pipeline {
    agent any

    stages {
        stage('Deliver') {
            steps {
                echo 'Delivering ....'
                sh """(cd /home/jonas/Documents/Projects/LunarHQ;git pull;npm i;tsc)"""
            }
        }
    }
}