<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:RDF="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:em="http://www.mozilla.org/2004/em-rdf#" >
<xsl:output method="text"/>

<xsl:template match="/"><xsl:value-of select="RDF:RDF/RDF:Description/em:version"/></xsl:template>

</xsl:stylesheet>