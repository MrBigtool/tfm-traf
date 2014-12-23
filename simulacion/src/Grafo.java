import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.io.Serializable;
import java.io.UnsupportedEncodingException;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Random;

import com.mongodb.BasicDBObject;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBCursor;
import com.mongodb.MongoClient;

import org.rosuda.JRI.Rengine;
import org.rosuda.JRI.REXP;
import org.rosuda.REngine.REXPMismatchException;
import org.rosuda.REngine.Rserve.RConnection;
import org.rosuda.REngine.Rserve.RserveException;

public class Grafo implements Serializable{
	
	private static final long serialVersionUID = 8799656478674716638L;
	static String FICH_ARISTAS="F7x000";
	static String FICH_ESTACIONES="F7x001";
	
	//map_recorridos(estacion,["estacion-estacion-estacion"])
	public static HashMap<Integer,ArrayList<String>> map_recorridos = new HashMap<Integer,ArrayList<String>>();
	// map_ruta("inicio-fin","estacion-estacion-estacion")
	public static HashMap<String,String> map_ruta = new HashMap<String,String>();
	// map_viajeros("inicio-fin",viajeros)
	public static HashMap<String,Integer> map_viajeros = new HashMap<String,Integer>();
	
	// map_zonas("zona", estaciones[])
	public static HashMap<String,ArrayList<Integer>> map_zonas = new HashMap<String,ArrayList<Integer>>();
	
	//map_estaciones(id_estacion,[id_estacion,estacion,linea,zona,coordX,coordY,transbordo])
	public static HashMap<Integer,String[]> map_estaciones = new HashMap<Integer,String[]>();


	public static void GeneraAristas(boolean imprime_trazas) throws IOException{
		InputStream inputStream = null;
		OutputStream outputStream = null;
		try {
			InputStream stream2 = Grafo.class.getClassLoader().getResourceAsStream("aristas.ncol");
			BufferedReader reader2 = new BufferedReader(new InputStreamReader(stream2));
			File f = new File(FICH_ARISTAS);
			FileWriter fr = new FileWriter(f);
			BufferedWriter br  = new BufferedWriter(fr);
			String line = null;
			while ((line = reader2.readLine()) != null) {
				if(imprime_trazas) System.out.println(line);
				br.write(line+'\n');
			}
			br.close();
			reader2.close();
		} finally {
			if (inputStream != null) {
				try {
					inputStream.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
	}
	public static void GeneraEstaciones(boolean imprime_trazas) throws IOException{
		InputStream inputStream = null;
		OutputStream outputStream = null;
		try {
			InputStream stream2 = Grafo.class.getClassLoader().getResourceAsStream("estaciones.csv");
			BufferedReader reader2 = new BufferedReader(new InputStreamReader(stream2));
			File f = new File(FICH_ESTACIONES);
			FileWriter fr = new FileWriter(f);
			BufferedWriter br  = new BufferedWriter(fr);
			String line = null;
			while ((line = reader2.readLine()) != null) {
				if(imprime_trazas) System.out.println(line);
				br.write(line+'\n');
			}
			br.close();
			reader2.close();
		} finally {
			if (inputStream != null) {
				try {
					inputStream.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
	}
	public static String format(Number n) {
        NumberFormat format = DecimalFormat.getInstance();
        format.setRoundingMode(RoundingMode.FLOOR);
        format.setMinimumFractionDigits(0);
        format.setMaximumFractionDigits(2);
        return format.format(n);
    }
	public static boolean printGrafo() {
		System.out.println(" ------------------------------------ ");
		System.out.println(" MAPA RECORRIDOS POSIBLES                  (NO SIGNIFICAN ESTACIONES DE INICIO): ");
		System.out.println(" ------------------------------------ ");
		Iterator it = map_recorridos.entrySet().iterator();
		int count=0;
	    while (it.hasNext()) {
	        Map.Entry pairs = (Map.Entry)it.next();
	        ArrayList<String> recorridos=(ArrayList<String>) pairs.getValue();
	        System.out.println(" DESDE "+pairs.getKey() + " :");
	        for (int i=0;i<recorridos.size();i++) {
	            System.out.println("     -> "+recorridos.get(i));
	            count++;
	        }
	    }
	    System.out.println(count+" recorridos posibles ");
	    if(count>0)return true;
	    return false;
	}
	
	public static void GuardaRecorridos() throws FileNotFoundException, UnsupportedEncodingException {
		System.out.println("Guardando...");
		PrintWriter writer = new PrintWriter("recorridos.json", "UTF-8");
		Iterator it = map_recorridos.entrySet().iterator();
		writer.println("[{");
		String ruta="";
		String ruta_ant="";
		String[] est=null;
		String linea_guardada="";
	    while (it.hasNext()) {
	        Map.Entry pairs = (Map.Entry)it.next();
	        ArrayList<String> recorridos=(ArrayList<String>) pairs.getValue();
	        ruta="";
	        for (int i=0;i<recorridos.size();i++) {
	        	if(i>0)ruta+="-";
	            ruta=recorridos.get(i);
		        est=ruta.split("-");
		        if(!ruta_ant.equals(ruta)){
		        	linea_guardada="{\"INICIO\":\""+pairs.getKey()+"\", \"FIN\":\""+est[est.length-1]+"\", \"RECORRIDO\":\""+ruta+"\"},";
		        	writer.println(linea_guardada);
		        	System.out.println(linea_guardada);
		        }
		        ruta_ant=ruta;
	        }

	    }
	    writer.println("}]");
	    System.out.println("FIN");
	    //System.out.println(count+" recorridos posibles ");
	}
	public static void printZonas() {
		System.out.println(" ------------------------------------ ");
		System.out.println(" MAPA ZONAL ");
		System.out.println(" ------------------------------------ ");
		Iterator it = map_zonas.entrySet().iterator();
		int count=0;
	    while (it.hasNext()) {
	        Map.Entry pairs = (Map.Entry)it.next();
	        ArrayList<Integer> recorridos=(ArrayList<Integer>) pairs.getValue();
	        System.out.println(" ZONA "+pairs.getKey() + " :");
	        for (int i=0;i<recorridos.size();i++) {
	            System.out.print("  ["+i+"]="+recorridos.get(i));
	            count++;
	        }
	        System.out.println();
	    }
	    System.out.println(count+" estaciones ");
	}
	
	public String Zona(int estacion){
		return map_estaciones.get(estacion)[3];
	}
	
	public String Linea(int estacion){
		return map_estaciones.get(estacion)[2];
	}
	
	public static int randomize(int k){
	     Random rand=new Random();
	     return rand.nextInt(k);
	}
	
	public static ArrayList<Integer> Ida(int inicio, int destino, boolean trazear) {
		ArrayList<Integer> viaje=new ArrayList<Integer>();
		if(trazear)System.out.print(" IDA INICIO "+inicio+" DESTINO "+destino+": ");
		String recorrido=map_ruta.get(inicio+"-"+destino);
		String[] viaje_destino=recorrido.split("-");
		for(int i=0;i<viaje_destino.length;i++){
			viaje.add(Integer.parseInt(viaje_destino[i]));
		}
		if(trazear){
			for(int i=0;i<viaje.size();i++){
				System.out.print(viaje.get(i)+" ");
			}
			System.out.println();
		}
		return viaje;
	}
	
	public static ArrayList<Integer> Ida(int destino, boolean trazear) {
		ArrayList<Integer> viaje=new ArrayList<Integer>();
		if(trazear)System.out.print(" IDA DESTINO "+destino+": ");
		ArrayList<String> recorridos=map_recorridos.get(destino);
		String[] viaje_destino=recorridos.get(randomize(recorridos.size())).split("-");
		for(int i=viaje_destino.length-1;i>=0;i--){
			viaje.add(Integer.parseInt(viaje_destino[i]));
		}
		if(trazear){
			for(int i=0;i<viaje.size();i++){
				System.out.print(viaje.get(i)+" ");
			}
			System.out.println();
		}
		return viaje;
	}
	
	public static ArrayList<Integer> IdaVuelta(int destino, boolean trazear){
		ArrayList<Integer> viaje=new ArrayList<Integer>();
		if(trazear)System.out.print(" IDA-VUELTA DESTINO "+destino+": ");
		ArrayList<String> recorridos=map_recorridos.get(destino);//recorrido aleatorio
		int alea=randomize(recorridos.size());
		String[] viaje_destino=recorridos.get(alea).split("-");
		for(int i=viaje_destino.length-1;i>=0;i--){
			viaje.add(Integer.parseInt(viaje_destino[i]));
		}
		for(int i=0;i<viaje_destino.length;i++){
			viaje.add(Integer.parseInt(viaje_destino[i]));
		}
		if(trazear){
			for(int i=0;i<viaje.size();i++){
				System.out.print(i+":");
				System.out.print(viaje.get(i)+" ");
			}
			System.out.println();
		}
		return viaje;
	}
	
	private static void CargarGrafo() throws RserveException, REXPMismatchException, IOException {
		Date d=new Date();
		
		File f_aristas = new File(FICH_ARISTAS);
		if(f_aristas.exists() && !f_aristas.isDirectory()) {
		    	/*    
		    	*     INSTALAR RSERVE: install.packages("igraph")
		    	*     INSTALAR RSERVE: install.packages("Rserve")
		    	*     in R (I have RStudio - convenient thing: Download RStudio IDE). started Rserve is from within R, just type
		    	*     EJECUTAR EL SERVICIO: library(Rserve)
		    	*     EJECUTAR EL SERVICIO: Rserve()
				*/
				
				//CARGAR GRAFO:
			    RConnection c =null;
			    try{
				    c = new RConnection();
			    }catch(Exception e){
			    	System.out.println("RConnection:Failed");
			    	System.out.println("___INSTALAR___");
			    	System.out.println("install.packages(\"igraph\")");
			    	System.out.println("install.packages(\"Rserve\")");
			    	System.out.println("___EJECUTAR___");
			    	System.out.println("library(Rserve)");
			    	System.out.println("Rserve()");
			    	System.exit(1);
			    	
			    }
				String file_path=System.getProperty("user.dir")+"\\"+f_aristas.getName();
				//System.out.println("Cargando el fichero "+file_path);
				org.rosuda.REngine.REXP x = c.eval("library(igraph);");
				
				String comandoR="grafo <- read.graph(\""+file_path+"\", dir=FALSE, format='ncol')";
				comandoR=comandoR.replace("\\","\\\\");
				//comandoR="edges <- read.table(\"C:\\\\Documents and Settings\\\\Pedro\\\\Desktop\\\\Workspace\\\\Simulador\\\\F7x000\")";
				//ImprimeTablaR(c,"aristas");
				//System.out.println(comandoR);
				x = c.eval(comandoR);
			
				x = c.eval("plot(grafo);");
				//x = c.eval("dev.copy(png,filename=\""+System.getProperty("user.dir")+"\\grafo.png\");");
				//x = c.eval("dev.off();");
				//x = c.eval("graphics.off();");
	
				x = c.eval("vertices <- V(grafo)$name");
				//ImprimeSecuenciaR(c, "vertices"); 
				//x = c.eval("vertices[1]");
				//System.out.println("VERTICE 1: "+x.asString());
	
				
			org.rosuda.REngine.REXP x1 = c.eval("length(vertices)");int len=x1.asInteger();
			org.rosuda.REngine.REXP x2 = null;
			org.rosuda.REngine.REXP x3 = null;
			org.rosuda.REngine.REXP x4=null;
			org.rosuda.REngine.REXP x5=null;
			org.rosuda.REngine.REXP cls1=null;
			String v;
			String comando="";
			System.out.println("  CARGANDO RECORRIDOS... "+d);
			String resultado;
			for(int i=1; i<=len; i++){
			    cls1 = c.eval("vertices["+i+"]");
			    v=cls1.asString();
			    //N�mero de saltos a todos los otros nodos desde 1:
			    //res<- shortest.paths(grafo, v=1)
			    try{
			    	comando="res<-get.all.shortest.paths(grafo, "+i+")";
			    	x2= c.eval(comando);
		    	}catch(Exception e){
		    		 System.out.println("ERROR: "+comando);System.exit(0);
		    	}
			    try{
			    		comando="length(res$res)";
					    x3= c.eval(comando);
			    	}catch(Exception e){
			   		 System.out.println("ERROR: "+comando);System.exit(0);
			   	}
			    for(int j=1; j<=Integer.parseInt(x3.asString()); j++){
			    	resultado="";
		    	   try{
		    		   comando="length(res$res[["+j+"]])";
		    		   x4= c.eval(comando);
		    	   }catch(Exception e){
		    		   System.out.println("ERROR: "+comando);System.exit(0);
		    	   }
			       for(int w=1; w<=Integer.parseInt(x4.asString()); w++){
			    	   comando="vertices[res$res[["+j+"]]["+w+"]]";
			    	   try{
			    		   x5= c.eval(comando);
			    	   }catch(Exception e){
			    		   System.out.println("ERROR: "+comando);System.exit(0);
			    	   }
			    	   if(v!=x5.asString()){
			    		   if(w>1){
			    			   resultado+="-";
			    		   }else{//nuevo array
			    			   if(! map_recorridos.containsKey(Integer.parseInt(v))){
			    				   ArrayList<String> nuevo= new ArrayList<String>();		  
			    				   map_recorridos.put(Integer.parseInt(v),nuevo);
			    			   }
			    		   }
			    		   resultado+=x5.asString();
			    	   }
			       }
			       if(resultado.contains("-")){ //no inserto recorridos con una sola parada!!
			    	   ArrayList<String> recorridos=map_recorridos.get(Integer.parseInt(v));
			    	   recorridos.add(new String(resultado));
				       map_recorridos.put(Integer.parseInt(v),recorridos);
				       String[] paradas=resultado.split("-");
				       map_ruta.put(paradas[0]+"-"+paradas[paradas.length-1],resultado);
				       map_viajeros.put(paradas[0]+"-"+paradas[paradas.length-1],0);
				       //System.out.println(resultado);
			       }
			    }
			}
			c.close();
		}
		d=new Date();
		System.out.println("  CARGANDO ESTACIONES... "+d);
		
		BufferedReader br = new BufferedReader(new FileReader(FICH_ESTACIONES));
	    try {
	        String line = br.readLine();
	        String[] valores=null;
	        while (line != null) {
	            if(line!="" && line!=null){
		            valores=line.split(",");
		            //System.out.println(valores[0]+") "+valores[1]);
		            map_estaciones.put(Integer.parseInt(valores[0]),valores);
		            
	    			   if(! map_zonas.containsKey(valores[3])){
	    				   ArrayList<Integer> nuevo= new ArrayList<Integer>();	
	    				   nuevo.add(Integer.parseInt(valores[0]));
	    				   map_zonas.put(valores[3],nuevo);
	    			   }else{
	    				   ArrayList<Integer> arr=new ArrayList<Integer>(map_zonas.get(valores[3]));
	    				   arr.add(Integer.parseInt(valores[0]));
	    				   map_zonas.put(valores[3],arr);
	    			   }
	            }
	            line = br.readLine();
	        }
	    } finally {
	        br.close();
	    }
		
	}
	
	public static void ImprimeSecuenciaR(RConnection c, String seq) throws RserveException, REXPMismatchException{
		org.rosuda.REngine.REXP x1 = c.eval("length("+seq+")");
		org.rosuda.REngine.REXP cls1=null;
		String v;
		System.out.println("--------------------------");
		System.out.print("VERTICES: ");
		for(int i=1; i<=x1.asInteger(); i++){
		    cls1 = c.eval(seq+"["+i+"]");
		    v=cls1.asString();
		    System.out.print(v+" ");
		}
		System.out.println();
	}
	
	public static void ImprimeTablaR(RConnection c, String tabla) throws RserveException, REXPMismatchException{
		org.rosuda.REngine.REXP x1 = c.eval("nrow("+tabla+")");
		org.rosuda.REngine.REXP x2 = c.eval("ncol("+tabla+")");
		org.rosuda.REngine.REXP cls1=null;

		for(int i=1; i<=x1.asInteger(); i++){
		    for(int j=1; j<=x2.asInteger(); j++){
		                     cls1 = c.eval("c1 <- "+tabla+"["+i+","+j+"]");
		                     System.out.print(cls1.asInteger()+" ");
		    }
		    System.out.println();
		}
	}
	
	public Grafo(String[] arg) throws IOException, RserveException, REXPMismatchException {
		if(arg.length==2 && arg[0].equals("F7x000") && arg[1].equals("F7x001")){
			GeneraAristas(false);
			GeneraEstaciones(false);
		}else{
			FICH_ARISTAS=arg[0];
			FICH_ESTACIONES=arg[1];
		}
		if(arg!=null && arg.length==2){
			CargarGrafo();
			printGrafo();
			//printZonas();
			//System.out.println("Recorridos posibles: "+this.map_recorridos.size());
			//Ida(6,10);
			//Ida(10);
			//IdaVuelta(10);
		}else{
			System.out.println("Se esperan argumentos");
			for(int i=0;i<arg.length;i++){
				System.out.println("ARG["+i+"] = "+arg[i]);
			}
		}
		
		/*       INTERACTUAR CON MONGODB:
		
		InputStream stream = Cargar_grafo.class.getClassLoader().getResourceAsStream("estaciones.txt");
		BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
		DB db=(new MongoClient("localhost",27017)).getDB("monitor");
		DBCollection coll=db.getCollection("estaciones");
		BasicDBObject DBO;
		String[] array;
		String line = null;
		while ((line = reader.readLine()) != null) {
		    //System.out.println(line);
			array = line.split("#");
			//for(int i=0;i<array.length;i++){System.out.println(i+" = "+array[i]);}
		    DBO=new BasicDBObject();
			DBO.put("id_estacion", array[0]);
			DBO.put("nombre", array[1]);
			DBO.put("linea", array[2]);
			DBO.put("zona", array[3]);
			DBO.put("coord_x", array[4]);
			DBO.put("coord_y", array[5]);
			DBO.put("transbordo", array[6]);
			coll.insert(DBO);
			
		}
		
		BasicDBObject DBO2=new BasicDBObject();
		DBCursor cursor=coll.find();
		while (cursor.hasNext()) System.out.println(cursor.next());*/
	}


}
