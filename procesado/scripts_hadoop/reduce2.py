#!/usr/bin/env python
import sys
(clave,values,clave_ant,count) = (None,None,None,0)
#El problema de muchas claves hace que tenga que agrupar {1#2#3} {4}
for line in sys.stdin:
	(clave,c)=line.strip().split('\t')
	values=clave.split('#')
	if len(values)==6:
		if clave_ant!=None and clave_ant!=clave:
			(linea, est_ini,dia_sem,mes,anyo,hora) = clave_ant.split('#')
			print '{"linea":"%s","cod_est":"%s","dia_sem":"%s","mes":"%s","anyo":"%s","hora":"%s","suma":"%d"},' % (linea,est_ini,dia_sem,mes,anyo,hora, count)
			count=int(c)
		else:
			count=count+int(c)
		clave_ant=clave
if count>0 and clave_ant:
	(linea, est_ini,dia_sem,mes,anyo,hora) = clave_ant.split('#')
	print '{"linea":"%s","cod_est":"%s","dia_sem":"%s","mes":"%s","anyo":"%s","hora":"%s","suma":"%d"}' % (linea,est_ini,dia_sem,mes,anyo,hora, count)


