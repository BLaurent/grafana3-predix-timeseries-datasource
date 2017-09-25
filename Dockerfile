FROM grafana/grafana:4.4.3

COPY dist/ /var/lib/grafana/plugins/grafana-datasource-predix-timeseries/
