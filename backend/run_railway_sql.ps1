# Run this script to set up Railway MySQL database
# Replace these values with your actual Railway MySQL variables

$MYSQLHOST = "YOUR_MYSQLHOST"       # e.g. monorail.proxy.rlwy.net
$MYSQLPORT = "YOUR_MYSQLPORT"       # e.g. 12345
$MYSQLUSER = "YOUR_MYSQLUSER"       # e.g. root
$MYSQLPASSWORD = "YOUR_MYSQLPASSWORD"
$MYSQLDATABASE = "YOUR_MYSQLDATABASE"  # e.g. railway

$mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

Write-Host "Step 1: Creating tables from schema.sql..."
Get-Content "src\main\resources\schema.sql" | & $mysql -h $MYSQLHOST -P $MYSQLPORT -u $MYSQLUSER -p"$MYSQLPASSWORD" $MYSQLDATABASE
Write-Host "Tables created!"

Write-Host "Step 2: Loading demo workers..."
Get-Content "demo_workers.sql" | & $mysql -h $MYSQLHOST -P $MYSQLPORT -u $MYSQLUSER -p"$MYSQLPASSWORD" $MYSQLDATABASE
Write-Host "Demo workers loaded!"

Write-Host "Step 3: Loading demo providers and jobs..."
Get-Content "demo_providers_jobs.sql" | & $mysql -h $MYSQLHOST -P $MYSQLPORT -u $MYSQLUSER -p"$MYSQLPASSWORD" $MYSQLDATABASE
Write-Host "Demo data loaded!"

Write-Host "All done! Database is ready."
