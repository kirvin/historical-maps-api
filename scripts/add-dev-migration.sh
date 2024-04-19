if [ $# -eq 0 ]
  then
    echo "No arguments supplied"
    exit 1
fi

npx prisma migrate dev --name $1