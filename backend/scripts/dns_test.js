import dns from 'dns';

dns.resolveSrv('_mongodb._tcp.cluster0.jqws2tz.mongodb.net', (err, addresses) => {
  if (err) {
    console.error('DNS Srv Resolve Error:', err);
  } else {
    console.log('Addresses:', addresses);
    // Resolve first address
    if (addresses.length > 0) {
      dns.lookup(addresses[0].name, (err2, address) => {
        if (err2) console.error('DNS Lookup Error:', err2);
        else console.log('IP Address:', address);
      });
    }
  }
});
