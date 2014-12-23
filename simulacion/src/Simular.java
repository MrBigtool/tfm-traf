import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.UnsupportedEncodingException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.Random;

import org.rosuda.REngine.REXPMismatchException;
import org.rosuda.REngine.Rserve.RserveException;

public class Simular {
	static int MIN_POR_PARADA=6; //minutos por parada
	static int SALTO_TIEMPO_SIMULADOR=1; //minutos cada vez que inicia el bucle while(true)
	static String FICH_GRAFO="C:\\GRAFO.gf";
	static long NUM_VIAJEROS=0;
	static int errores=0;
	
	
	static long mensaje_viajeros=1000;
	//Muestra un mensaje cada vez que supera esta cifra de viajeros:
	static long limite_mensaje=1000;
	static long LIMITE_VIAJEROS_SIMULADOS=30000000;//30 MILLONES
	
	public static double round(double value, int places) {
	    if (places < 0) throw new IllegalArgumentException();

	    long factor = (long) Math.pow(10, places);
	    value = value * factor;
	    long tmp = Math.round(value);
	    return (double) tmp / factor;
	}
	
	public static int  randomize(int k){
	     Random rand=new Random();
	     return rand.nextInt(k);
	}
	
	public static void ViajesAleatorio(Grafo g, Date d, int ite){	
		int num_personas=0;
		ArrayList<Integer> recorrido;
		String zona="";
		
		Calendar calendar = GregorianCalendar.getInstance(); 
		calendar.setTime(d); 
		int hora=calendar.get(Calendar.HOUR_OF_DAY);
		
		boolean laborable=true;
		if (calendar.get(Calendar.DAY_OF_WEEK) == Calendar.SUNDAY || calendar.get(Calendar.DAY_OF_WEEK) == Calendar.SATURDAY) {
			laborable=false;
		}
		boolean horapunta=false;
		if (hora==7 || hora==8 || hora==13 || hora==14 || hora==18 || hora==19 || hora==20){
			if(laborable &&( calendar.get(Calendar.DAY_OF_WEEK) != Calendar.FRIDAY && (hora==18 || hora==19 || hora==20))){
			    horapunta=true;
			}
		}
		if(Calendar.getInstance().get(Calendar.MONTH)==9){ //Agosto vacaciones
			horapunta=false;
			laborable=false;
		}
		
		double randomZonas = Math.random();// generamos un numero al azar entre 0 y 1 
		
		int incremento=4;
		if(laborable)incremento=14;
		
		double randomPersonas = Math.random();
		if(randomZonas <= 0.60){// el 60% de las veces 	
			if(horapunta)num_personas=(int) round(randomPersonas*=(22*incremento),0);
			else num_personas=(int) round(randomPersonas*=(20*incremento),0);
			zona="A";
		}else if(randomZonas <= 0.75){// el 25% de las veces 
			if(horapunta)num_personas=(int) round(randomPersonas*=(18*incremento),0);
			else num_personas=(int) round(randomPersonas*=(17*incremento),0);
			zona="B1"; 
		}else if(randomZonas <= 0.90){// el 15% de las veces 
			if(horapunta)num_personas=(int) round(randomPersonas*=(16*incremento),0);
			else num_personas=(int) round(randomPersonas*=(14*incremento),0);
			zona="B2";
		}else if(randomZonas <= 1){// el 10% de las veces 
			if(horapunta)num_personas=(int) round(randomPersonas*=(14*incremento),0);
			else num_personas=(int) round(randomPersonas*=(13*incremento),0);
			zona="B3";
		}
		
		if(num_personas==0)num_personas=1;
		
		if(g.map_zonas.containsKey(zona)){
			SimpleDateFormat formato = new SimpleDateFormat("dd/MM/yy HH:mm");
			//System.out.print("ZONA: "+zona+" "+" NUM: "+num_personas+" FECHA: "+formato.format(d));
			int est_aleatoria=randomize(g.map_zonas.get(zona).size());
			int destino=g.map_zonas.get(zona).get(est_aleatoria);
			
			double randomTipoBillete = Math.random();
			if(randomTipoBillete <= 0.95){
				recorrido=Grafo.IdaVuelta(destino, false);//inicio aleatorio
			}else{
				recorrido=Grafo.Ida(destino, false);//inicio aleatorio
			}
			if(recorrido==null && recorrido.size()>0){
				System.out.println("Error generando recorrido!");
				System.exit(1);
			}
			
			double randomGrupo;
			Viajar v=null;
			for(int i=0;i<num_personas;i++){
				//System.out.println("        Lanzando viaje "+i+"...");
				try{
					v=new Viajar(d, recorrido, 1, MIN_POR_PARADA, g, true);
				}catch(Exception e){
					System.out.println(errores+") ERROR [Viajar] "+e);
					errores++;
					if(errores>3)System.exit(1);
				}
				
				try{
					v.run();
				}catch(Exception e){
					System.out.println(errores+") ERROR [Inicio viaje] "+e);
					errores++;
					if(errores>3)System.exit(1);
				}
				//new Viajar(d, recorrido, 1, MIN_POR_PARADA).start();
				//randomGrupo=Math.random();
				//if(randomGrupo<0.98) new Viajar(d, recorrido, 1, MIN_POR_PARADA).start();
				//else new Viajar(d, recorrido, randomize(4), MIN_POR_PARADA).start();  // GRUPO DE PERSIONAS
			}
			NUM_VIAJEROS+=num_personas;

			Date d2=null;
			if(NUM_VIAJEROS/mensaje_viajeros>0 || (NUM_VIAJEROS<15)){
				     d2=new Date();
			         System.out.println("                                                         NUM: "+NUM_VIAJEROS+" #"+d2);
			         System.out.println(ite+") Simulación a "+d);
			         mensaje_viajeros=NUM_VIAJEROS+limite_mensaje;//aumento la cifra hasta siguiente mensaje
			}
			
			if (NUM_VIAJEROS==LIMITE_VIAJEROS_SIMULADOS){
				System.out.println(" SE ALCANZARON LOS "+NUM_VIAJEROS+" DE VIAJEROS = 1Gb datos ");
				System.exit(0);
			}
		}else{
			//System.out.println("No existe la zona "+zona);
		}
	}
	
	
	public static void serializaGrafo(Grafo g)throws IOException{
	    String fileName= FICH_GRAFO;
	    FileOutputStream fos = new FileOutputStream(fileName);
	    ObjectOutputStream oos = new ObjectOutputStream(fos);
	    oos.writeObject(g);
	    oos.close();
	}

	public static Grafo deserializaFichero() throws IOException, ClassNotFoundException{
	   String fileName= FICH_GRAFO;
	   FileInputStream fin = new FileInputStream(fileName);
	   ObjectInputStream ois = new ObjectInputStream(fin);
	   Grafo g= (Grafo) ois.readObject();
	   ois.close();
	   return g;
	}
	
	
	public static void main (String[] arg) throws RserveException, IOException, REXPMismatchException, ClassNotFoundException, ParseException {
		
		SimpleDateFormat sdf = new SimpleDateFormat("dd-M-yyyy hh:mm:ss");
		String dateInString = "01-01-2014 07:00:00";
		Date d = sdf.parse(dateInString);
		int mes=d.getMonth();
		
		
		long t=d.getTime();
		long MIN1=60000;
	    long AnyadoTiempo = MIN1 * SALTO_TIEMPO_SIMULADOR ; // x minutos adicionales en cada bucle
	    d=new Date( t + AnyadoTiempo);
		
		
		System.out.println("Comienza la simulación a "+d);
		System.out.println();
		
		//*Cargar grafo:
		Grafo g=new Grafo(arg);
		g.GuardaRecorridos();
		System.out.println(" GRAFO CARGADO ");
		serializaGrafo(g);
		System.out.println(" GRAFO GUARDADO EN "+FICH_GRAFO);
		//System.exit(1);
		/* LECTURA GRAFO DESDE FICHERO
		Grafo g=deserializaFichero(); //Cargar fichero
		System.out.println(" GRAFO CARGADO DE "+FICH_GRAFO);
		*/
		/*if(!g.printGrafo()){
			System.out.println("No hay recorridos en este grafo.");
			System.exit(1);
		}*/
		
		System.out.println("Simulando viajeros... ");
		
		Calendar calendar = GregorianCalendar.getInstance(); 
		int hora;
		int dia=0;
		int i=0;
		while(true){
			t=d.getTime();
		    AnyadoTiempo+=MIN1 * SALTO_TIEMPO_SIMULADOR; // x minutos adicionales en cada bucle
		    d=new Date( t + AnyadoTiempo);
		    calendar.setTime((Date)d); 
		    
		    if(calendar.get(Calendar.YEAR)==2015){ 
		    	System.out.println(" AÑO 2015 . FIN DE LA SIMULACIÓN ");
		    	System.exit(1);
		    }
		    
			hora=calendar.get(Calendar.HOUR_OF_DAY);
			if(hora<=6){ //Si supera el horario del metro pasa al dia siguiente
		        calendar.set(Calendar.HOUR, 7);
			}
			if(hora>=23){ //Si supera el horario del metro pasa al dia siguiente
		        calendar.set(Calendar.HOUR, 6);
		        calendar.add(Calendar.DATE, 1);
			}
			i++;
			d=calendar.getTime();
			for(int e=0;e<100;e++){ //100 ráfagas de viajes aleatorios cada 4 minutos
			     ViajesAleatorio(g,d,i);
			}
			
		}
	}
}
