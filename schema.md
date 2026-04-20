### table "datasource"
name - string
host - string
owner/pic - string
source engine - string
type - string
port - integer
DB.schema.tabel - string
description - string
specs - string
credentials - string
created_by - string
created_at - datetime
updated_by - string
updated_at - datetime
isactive - boolean

### table "dataflows"
etl server - string
etl type - string
etl script/executables folder - string
etl main script/executables file - string
etl execution env - string
cronschedule - string
created_by - string
created_at - datetime
updated_by - string
updated_at - datetime
isactive - boolean

### table "destination"
type - string
path destination - string
pic - string
description - string
created_by - string
created_at - datetime
updated_by - string
updated_at - datetime
isactive - boolean


### table "users"
username - string
password - string
role - string
created_by - string
created_at - datetime
updated_by - string
updated_at - datetime
isactive - boolean

### table "etl"
you can add the row itself, as long as it can connect datasource, dataflow, and destination
created_by - string
created_at - datetime
updated_by - string
updated_at - datetime
isactive - boolean