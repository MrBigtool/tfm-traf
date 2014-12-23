#!/usr/bin/env python
import sys
from datetime import datetime, date, time
for line in sys.stdin:
	line=line.strip().replace('\n','').rstrip('\n')
	values = line.split('\t')	
	if len(values)>4:
		user_id=values[0]
		tipo=values[1]
		est=int(values[2])
		fecha=datetime.strptime(values[3],"%d/%m/%y %H:%M")
		#date.weekday()=Monday is 0 and Sunday is 6
		hora=fecha.hour
		min=fecha.minute
		#dia_w=datetime.isoweekday(fecha)
		dia=fecha.day
		mes=fecha.month
		anyo=fecha.year
		print '%s#%d#%d#%d#%d#%d#%s\t%d' % (user_id,anyo, mes, dia, hora, min,tipo,est)

