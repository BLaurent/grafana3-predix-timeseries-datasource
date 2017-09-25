FROM grafana/grafana:4.5.2

RUN mkdir /var/lib/grafana/plugins/grafana-timeseries-datasource && \
      cp dist/* /var/lib/grafana/plugins/grafana-timeseries-datasource

