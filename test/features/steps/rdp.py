import json
import socket
import steps.utils as utils

class RDPConnection:
  def __init__(self, host='127.0.0.1', port=6000, timeout=120.0):
    self.host = host
    self.port = port
    self.timeout = timeout
    self.sock = None
    self.console_actor = None

  def _read_frame(self):
    header = b''
    while True:
      c = self.sock.recv(1)
      if not c:
        raise ConnectionError('RDP socket closed unexpectedly')
      if c == b':':
        break
      header += c

    length = int(header.decode('utf-8'))
    payload = b''
    while len(payload) < length:
      chunk = self.sock.recv(length - len(payload))
      if not chunk:
        raise ConnectionError('RDP socket closed unexpectedly')
      payload += chunk
    return json.loads(payload.decode('utf-8'))

  def _send_and_wait(self, payload, expected_actor=None):
    data = json.dumps(payload)
    wire_data = f'{len(data.encode('utf-8'))}:{data}'.encode('utf-8')
    self.sock.sendall(wire_data)

    while True:
      res = self._read_frame()
      # Ignore background telemetry and console log broadcasts
      if 'type' in res and res['type'] in [ 'consoleAPICall', 'pageError', 'tabListChanged', 'target-available-form', 'frameUpdate' ]:
        continue
      if expected_actor and res.get('from') != expected_actor:
        continue
      return res

  def connect(self):
    self.sock = socket.create_connection((self.host, self.port), timeout=self.timeout)
    self._read_frame()  # Connection greeting

    proc = self._send_and_wait({'to': 'root', 'type': 'getProcess', 'id': 0})
    descriptor_actor = proc['processDescriptor']['actor']

    target = self._send_and_wait({'to': descriptor_actor, 'type': 'getTarget'})
    self.console_actor = target['process']['consoleActor']

  def execute(self, js_code):
    escaped_code = (
      js_code.replace('\\', '\\\\')   # 1. Escape existing backslashes first
             .replace('`', '\\`')     # 2. Escape backticks
             .replace('${', '\\${')   # 3. Escape interpolation
    )
    escaped_code = f'`{escaped_code}`'
    js_code = f"""
      Zotero.debug('RDP bridge: executing\\n' + {escaped_code});
      {js_code}
    """
    
    wrapped = f'''
    (() => {{
      let __fn = async () => {{
        {js_code}
      }};

      let __done = false, __val, __err;
      __fn().then(
        v => {{ __val = v; __done = true; }},
        e => {{ __err = e; __done = true; }}
      );

      let __thread = Services.tm.currentThread;
      while (!__done) {{
        __thread.processNextEvent(true);
      }}

      if (__err) throw __err;
      return __val === undefined ? 'undefined' : JSON.stringify(__val);
    }})()
    '''

    ack = self._send_and_wait(
      {
        'to': self.console_actor,
        'type': 'evaluateJSAsync',
        'text': wrapped,
      },
      expected_actor=self.console_actor,
    )

    result_id = ack.get('resultID')
    if not result_id:
      raise RuntimeError(f'Evaluation request rejected: {ack}')

    while True:
      msg = self._read_frame()
      if (msg.get('type') == 'evaluationResult' and msg.get('resultID') == result_id):
        if msg.get('exception'):
          err = msg.get('exceptionMessage', msg.get('exception'))
          raise RuntimeError(f'Zotero JS Exception: {err}')

        raw_res = msg.get('result')

        if isinstance(raw_res, dict) and raw_res.get('isError'):
          msg_text = raw_res.get('preview', {}).get('message', 'Unknown error')
          raise RuntimeError(f'Zotero JS Error: {msg_text}')

        if isinstance(raw_res, str):
          if raw_res == 'undefined':
            return None
          try:
            return json.loads(raw_res)
          except json.JSONDecodeError:
            return raw_res

        return raw_res

  def close(self):
    if self.sock:
      self.sock.close()

  def __enter__(self):
    self.connect()
    return self

  def __exit__(self, exc_type, exc_val, exc_tb):
    self.close()
