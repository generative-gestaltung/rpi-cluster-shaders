#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <netdb.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <pthread.h>
#include <unistd.h>


#define BUFSIZE 1024

typedef struct {
  int sockfd; /* socket */
  int portno; /* port to listen on */
  int clientlen; /* byte size of client's address */
  struct sockaddr_in serveraddr; /* server's addr */
  struct sockaddr_in clientaddr; /* client addr */
  struct hostent *hostp; /* client host info */
  char buf[BUFSIZE]; /* message buf */
  char *hostaddrp; /* dotted decimal host addr string */
  int optval; /* flag value for setsockopt */
  int n; /* message byte size */
} UDP_STATE_T;

void error(char *msg) {
  perror(msg);
  exit(1);
}

void initSocket (UDP_STATE_T* state, int portno) {

  state->sockfd = socket(AF_INET, SOCK_DGRAM, 0);
  if (state->sockfd < 0)
    error("ERROR opening socket");

  state->optval = 1;
  setsockopt(state->sockfd, SOL_SOCKET, SO_REUSEADDR,
	     (const void *)&(state->optval) , sizeof(int));

  bzero((char *) &(state->serveraddr), sizeof(state->serveraddr));
  state->serveraddr.sin_family = AF_INET;
  state->serveraddr.sin_addr.s_addr = htonl(INADDR_ANY);
  state->serveraddr.sin_port = htons((unsigned short)portno);

  /*
   * bind: associate the parent socket with a port
   */
  if (bind(state->sockfd, (struct sockaddr *) &(state->serveraddr),
	   sizeof(state->serveraddr)) < 0)
    error("ERROR on binding");

  /*
   * main loop: wait for a datagram, then echo it
   */
  state->clientlen = sizeof(state->clientaddr);
  while (1) {

    bzero(state->buf, BUFSIZE);
    state->n = recvfrom(state->sockfd, state->buf, BUFSIZE, 0,
		 (struct sockaddr *) &(state->clientaddr), &(state->clientlen));
    if (state->n < 0)
      error("ERROR in recvfrom");

    state->hostp = gethostbyaddr((const char *)&(state->clientaddr.sin_addr.s_addr),
			  sizeof(state->clientaddr.sin_addr.s_addr), AF_INET);
    if (state->hostp == NULL)
      error("ERROR on gethostbyaddr");
    state->hostaddrp = inet_ntoa(state->clientaddr.sin_addr);
    if (state->hostaddrp == NULL)
      error("ERROR on inet_ntoa\n");

    printf("packet = %d %d\n", state->buf[0], state->buf[1]);
    state->n = sendto(state->sockfd, state->buf, strlen(state->buf), 0,
	       (struct sockaddr *) &(state->clientaddr), state->clientlen);
    if (state->n < 0)
      error("ERROR in sendto");
  }
}


/* this function is run by the second thread */
void *udp_listen(void *x_void_ptr) {

  UDP_STATE_T udp_state;
  initSocket(&udp_state, 8888);

}

int main() {

  int x = 0, y = 0;
  pthread_t udp_thread;

  if(pthread_create(&udp_thread, NULL, udp_listen, &x)) {
    fprintf(stderr, "Error creating thread\n");
    return 1;
  }

  // MAIN THREAD
  while(1) {

  }


  /* wait for the second thread to finish */
  if(pthread_join(udp_thread, NULL)) {
    fprintf(stderr, "Error joining thread\n");
    return 2;
  }
  /* show the results - x is now 100 thanks to the second thread */
  printf("x: %d, y: %d\n", x, y);
  return 0;
}
