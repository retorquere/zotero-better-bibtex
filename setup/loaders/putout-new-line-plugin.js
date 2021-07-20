module.exports.report = () => 'fix newlines'

module.exports.fix = (path) => {
    path.node.value.raw = path.node.value.raw.replace(/\n/g,'\\n');
};

module.exports.traverse = ({push}) => ({
    TemplateLiteral(path) {
        path.node.quasis.forEach((quasi, n) => {
          if (quasi.value.raw.includes('\n')) push(path.get(`quasis.${n}`))
        })
    }
});
