# Docker Multiple HTTP status checker

This project takes inspiration from [docker-status](https://github.com/zooniverse/docker-statushttps://github.com/zooniverse/docker-status) but the server side part is built with node.js. Can be used to check multiple API status pages at once, useful if used with components like Amazon Elastic Load Balances which allow just single HTTP status checks.

## How to use this
Let's say that you want to run multiple application containers on the same host behind a single ELB.

```
docker run -d --name="myapp1" -p "8081:8080" mywesomeapp1
docker run -d --name="myapp2" -p "8082:8080" mywesomeapp2
docker run -d --name="myapp3" -p "8083:8080" mywesomeapp3
```

If you want to check them all in once you can run `ninjatux/multiple-http-status-checker`, link it with your container and pass the endpoints of your APIs status pages.

```
docker run -d --name="statuschecker" -p "80:9090" --link "myapp1:myapp1" --link "myapp2:myapp2" --link "myapp3:myapp3" -e "API_HEALTH_ENDPOINTS=http://myapp1:8081/status,http://myapp2:8082/status,http://myapp3:8083/status" ninjatux/multiple-http-status-checker
```

Then going to `http://127.0.0.1:80/status` will trigger the check on all the endpoints configured. The results page will contain a simple `200 OK` if all the endpoints are up & running and a `500` with the full list of working and non working andpoint if one or more endpoint are down.

You can specify on which port the status application will listen specifying another environment variable called `PORT`.

The application expects the a list of endpoints separated by a comma in an environment variable called `API_HEALTH_ENDPOINTS`.
