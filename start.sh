NODE_ENV=production PORT=5000 forever start --minUptime 100 --spinSleepTime 100 -l ~/.forever/forever.log -o ./log/out.log -e ./log/err.log -w --watchIgnore '*.log' -a ./bin/www
