#!/usr/bin/env python
import sys, json, datetime
from collections import namedtuple
#from datetime import datetime, date, time, timedelta

#
#   CARGO LOS RECORRIDOS EN DICCIONARIO [est_inicio|estacion_fin]=recorrido
#
with open('recorridos.json', "r") as f:
	recorridos_json = json.loads(f.read())

RE = namedtuple('Recorridos', 'INICIO, FIN, RECORRIDO')
recorridos = [RE(**k) for k in recorridos_json["recorridos"]]

dicc_recorridos = dict()
for r in recorridos:
	dicc_recorridos[r.INICIO + '|' + r.FIN]=r.RECORRIDO

#
#  CARGO LAS ESTACIONES EN DICCIONARIO [estacion]=linea
#
with open('estaciones_CargaPython.json',"r") as f:
	estaciones_json=json.loads(f.read())

EST = namedtuple('estaciones','id,estacion,linea,zona,coord_x,coord_y,transbordo')
estaciones=[EST(**k) for k in estaciones_json["estaciones"]]

dicc_estaciones= dict()
for est in estaciones:
	dicc_estaciones[int(est.id)]=int(est.linea)


##  COMIENZO:

for line in sys.stdin:
	line=line.strip().replace('\n','').rstrip('\n')
	values = line.split('\t')	
		
	if len(values)==5 and values[0]!="-":
		est_ini=values[0]
		fecha_ini=datetime.datetime.strptime(values[1],"%d/%m/%Y %H:%M")
		est_fin=values[2]
		fecha_fin=values[3]
		sum=values[4]
		key=est_ini+'|'+est_fin
		if key in dicc_recorridos:
			ruta=dicc_recorridos[key].split("-")
			for e in ruta:
				fecha_ini+=datetime.timedelta(minutes=3)
				dia_sem=datetime.datetime.isoweekday(fecha_ini)
				if int(e) in dicc_estaciones:
					linea= dicc_estaciones[int(e)]
					print '%d#%s#%s#%s#%s#%s\t%s' % (linea, e, dia_sem,fecha_ini.month,fecha_ini.year, fecha_ini.hour,sum)
				else:
					print '0#%s#%s#%s#%s#%s\t%s' % (e, dia_sem,fecha_ini.month,fecha_ini.year, fecha_ini.hour,sum)

