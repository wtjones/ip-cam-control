# ip-cam-control

Perform minimal remote adminstration of supported IP cameras. This list includes:

* WVC80N


# example

```
var camSettings = {
  led: true,
  motionDetection: true,
  allowMobileStreaming: true
}

camControl.editCamSettings('192.168.0.99', '80', 'admin', 'mypassword', camSettings, function(err) {
    if (err) throw err;
});

```


# installation

`npm install ip-cam-control`


# settings

## led (boolean)

LED indicator

## motionDetection (boolean)

Option 'Trigger Motion Detection' on the Motion Detection admin page.

## allowMobileStreaming (boolean)

Option 'Enable Mobile Streaming' on the Options admin page.


# methods

### editCamSettings(hostname, port, user, pass, settings, callback)

First param of the callback will either contain an error or null.

### getCamSettings(hostname, port, user, pass, callback)

#### callback 

`function (err, result)`

```
result = {
	led: boolean
 	motionDetection: bool
 	allowMobileStreaming: bool
}
```


# license

MIT