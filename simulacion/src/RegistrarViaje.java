import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;

public class RegistrarViaje {
    private static final RegistrarViaje inst= new RegistrarViaje();
    private RegistrarViaje() {
        super();
    }
    public synchronized static void writeToFile(String file,String msg) throws IOException {
    	try(PrintWriter output = new PrintWriter(new FileWriter(file,true))){
    	    output.println(msg);
    	}catch (Exception e) {}
    }
    public static RegistrarViaje getInstance() {
        return inst;
    }
}