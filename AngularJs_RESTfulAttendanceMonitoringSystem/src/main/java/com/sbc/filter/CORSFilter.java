package com.sbc.filter;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet Filter implementation class CORSFilter - define CORSFilter in web.xml file
 * CORS stands for Cross Origin Resource Sharing. It is a mechanism that allows JavaScript (AngularJs or ReactJs) application to make 
 * AJAX requests to another domain, different from the domain from where it originated. By default, such web requests are forbidden in 
 * browsers, and they will result into same origin security policy errors. Using Java CORS filter, you may allow the webpage to make 
 * requests from other domains as well (known as cross domain requests). Used mostly in Web Services such as REST.
 * IMPORTANT! Placing CORSFilter file in any other packages gives error when application is started.
 */
// Enable it for Servlet 3.x implementations
/* @ WebFilter(asyncSupported = true, urlPatterns = { "/*" }) */
public class CORSFilter implements Filter {

    /**
     * Default constructor.
     */
    public CORSFilter() {
        // TODO Auto-generated constructor stub
    }
 
    
    /**
     * FILTER IMPLEMENTATION METHOD
     * @see javax.servlet.Filter#init(javax.servlet.FilterConfig)
     */
	@Override
	public void init(FilterConfig filterConfig) throws ServletException {
		// TODO Auto-generated method stub
		
	}

	
	/**
	 * FILTER IMPLEMENTATION METHOD
	 * @see javax.servlet.Filter#doFilter(javax.servlet.ServletRequest, javax.servlet.ServletResponse, javax.servlet.FilterChain)
	 */
	@Override
	public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain)
			throws IOException, ServletException {
		
		HttpServletRequest request = (HttpServletRequest) servletRequest;
        System.out.println("CORSFilter HTTP Request: " + request.getMethod());

        HttpServletResponse response = (HttpServletResponse) servletResponse;
       
        // Authorize (allow) all domains to consume the data
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods","GET, OPTIONS, HEAD, PUT, POST");
        response.setHeader("Access-Control-Max-Age", "3600");
        response.setHeader("Access-Control-Allow-Headers", "X-requested-with, Content-Type");
        
        // For HTTP OPTIONS verb/method reply with ACCEPTED status code -- per CORS handshake
        if (request.getMethod().equals("OPTIONS")) {
            response.setStatus(HttpServletResponse.SC_ACCEPTED);
            return;
        }
 
        // pass the request along the filter chain
        chain.doFilter(servletRequest, servletResponse);
		
	}

	
	/**
	 * FILTER IMPLEMENTATION METHOD
	 * @see javax.servlet.Filter#destroy()
	 */
	@Override
	public void destroy() {
		// TODO Auto-generated method stub
		
	}
 
    
}