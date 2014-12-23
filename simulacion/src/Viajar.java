import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.Random;


public class Viajar{
	final long MIN1=60000;//millisecs
	Date d;
	ArrayList<Integer> recorrido;
	int num_personas;
	int MIN_POR_PARADA;
	String fich="C:\\reg_viajeros.dat";
	Grafo g;
	boolean trazear;
	
	public static int randomize(int k){
	     Random rand=new Random();
	     return rand.nextInt(k);
	}
	
	public Viajar(Date f, ArrayList<Integer> recorrido2, int n , int MIN, Grafo g2, boolean t) {
		super();
		if(f==null ){
			System.out.println("ERROR f=null");
		}
		if(recorrido2==null){
			System.out.println("ERROR R=null");
		}
		if(g2==null){
			System.out.println("ERROR g=null");
		}

		this.d = f;
		this.recorrido = recorrido2;
		this.MIN_POR_PARADA = MIN;
		this.num_personas=n;
		this.g=g2;
		this.trazear=t;
	}

	public void run() {

		int user=randomize(300000);
		String mensaje="";
		int hora=0;
	
		Calendar calendar = GregorianCalendar.getInstance(); 
		
		try{
		   calendar.setTime(d); 
		   hora=calendar.get(Calendar.HOUR_OF_DAY);
		}catch(Exception e){
			System.out.println("Error estableciendo fecha de viaje.");
		}
		try{
			if(((Math.ceil(MIN_POR_PARADA*recorrido.size())/60)+hora)>24){ //Si supera el horario del metro pasa al dia siguiente
		        calendar.set(Calendar.HOUR_OF_DAY, 7);
		        calendar.set(Calendar.DAY_OF_YEAR, calendar.DAY_OF_YEAR+1);
			}
		}catch(Exception e){
			System.out.println("Error corrigiendo fecha de viaje.");
		}
			
		long t=d.getTime();
		int parada_ant=0;
		
		SimpleDateFormat formato = new SimpleDateFormat("dd/MM/yy HH:mm");
		String zona="", linea="";
		for(int i=0;i<num_personas;i++){ //INICIA VIAJE 
			try{
				//System.out.println("Estacion: "+recorrido.get(0));
			    zona=g.Zona(recorrido.get(0));
			}catch(Exception e){
				System.out.println("Error de zona");System.exit(1);
			}
			try{
				linea=g.Linea(recorrido.get(0));
			}catch(Exception e){
				System.out.println("Error de linea");System.exit(1);
			}
			try{
				if(calendar.get(Calendar.HOUR_OF_DAY)<=6){ //Si supera el horario del metro pasa al dia siguiente
			        calendar.set(Calendar.HOUR, 7);
				}
				mensaje=user+"\tINI\t"+recorrido.get(i)+"\t"+formato.format(d)+"\t"+zona+"\t"+linea;
			}catch(Exception e){
				System.out.println("Error construyendo mensaje (1).");
			}
			Escribir(mensaje, trazear);
		}
		
		for(int i=0;i<recorrido.size();i++){
			t=d.getTime();
			if(recorrido.get(i)==parada_ant){ //es ida y vuelta, ahora validara para volver
				try{
					mensaje=user+"\tFIN\t"+recorrido.get(i)+"\t"+formato.format(d)+"\t"+g.Zona(recorrido.get(i))+"\t"+g.Linea(recorrido.get(i));
				}catch(Exception e){
					System.out.println("Error construyendo mensaje (2).");
				}
				
				Escribir(mensaje, trazear);
				
				d=new Date(t + (MIN1*MIN_POR_PARADA)  + ( MIN1*20*randomize(40)));
				calendar.setTime(d); 
				hora=calendar.get(Calendar.HOUR_OF_DAY);
				if(hora<=6){ //Si supera el horario del metro pasa al dia siguiente:
			        calendar.set(Calendar.HOUR_OF_DAY, 6);
			        calendar.set(Calendar.DAY_OF_YEAR, calendar.DAY_OF_YEAR+1);
				}
				
				mensaje=user+"\tINI\t"+recorrido.get(i)+"\t"+formato.format(d)+"\t"+g.Zona(recorrido.get(i))+"\t"+g.Linea(recorrido.get(i));
				Escribir(mensaje, trazear);
				
			}else{
				d=new Date(t + (MIN1*MIN_POR_PARADA));
			}
			
			//System.out.println(Thread.currentThread().getId()+" ## Viajero "+user+" RECORRIDO: "+imprime(recorrido,i)+" -- "+formato.format(d));
			parada_ant=recorrido.get(i);
		}
		for(int i=0;i<num_personas;i++){ //FINALIZA VIAJE
			mensaje = user+"\tFIN\t"+recorrido.get(recorrido.size()-1)+"\t"+formato.format(d)+"\t"+g.Zona(recorrido.get(recorrido.size()-1))+"\t"+g.Linea(recorrido.get(recorrido.size()-1));
			Escribir(mensaje, trazear);
		}
	}
	
	private void Escribir(String mensaje, boolean trazear){
		//if(trazear)System.out.println(mensaje);
		RegistrarViaje.getInstance();
		try {
			RegistrarViaje.writeToFile(fich, mensaje);
		} catch (Exception e) {
			System.out.println("Error registrando viaje en el fichero.");
		}
	}

	private String imprime(ArrayList<Integer> recorrido2, int ind) {
		String ruta="";
		for(int i=0;i<recorrido2.size();i++){
			if(i==ind)ruta+=" ["+recorrido2.get(i)+"]";
			else ruta+=" "+recorrido2.get(i);
		}
		return ruta;
	}

}
