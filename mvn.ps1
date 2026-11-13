$mvnBin = "C:\Users\manna\.m2\wrapper\dists\apache-maven-3.9.16-bin\5grr65jo27hi51sujmtcldfovl\apache-maven-3.9.16\bin\mvn.cmd"
$pomPath = Join-Path $PSScriptRoot "backend\pom.xml"
& $mvnBin -f $pomPath $args
