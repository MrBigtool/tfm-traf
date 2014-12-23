#!/usr/bin/env python
import sys 
(tipo, est_ini, est_fin, user, fecha_hora) = (None, None, None, None, None)
(user_ant, fecha_hora_ini, fecha_hora_fin, count)=(None,None,None, 1)
(min,hora,dia,mes,anyo,est,user)=(None,None,None,None,None,None,None)
clave = None
 
for line in sys.stdin:
	(clave,est)=line.strip().split('\t')
	values=clave.split('#')
	if len(values)==7:
		(user,anyo,mes,dia,hora,min,tipo)=values
		fecha_hora = '%s/%s/%s %s:%s' % (dia,mes,anyo,hora,min)
		if tipo=='INI':
			est_ini=est
			fecha_hora_ini=fecha_hora
		elif tipo== 'FIN' and est_ini!=None: #INICIO-FIN [OK]
			est_fin=est
			fecha_hora_fin=fecha_hora
			if user==user_ant:
				print '%s\t%s\t%s\t%s\t%d' % (est_ini,fecha_hora_ini,est_fin, fecha_hora_fin,count)
		elif tipo=='FIN' and est_ini==None: # FIN sin inicio...
			est_fin=est
			fecha_hora_fin=fecha_hora
			print '-\t-\t%s\t%s\t%d' % (est_fin,fecha_hora_fin,count)
		if tipo=='FIN':
			est_ini=None
		user_ant=user

