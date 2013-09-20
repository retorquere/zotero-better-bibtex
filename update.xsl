<?xml version="1.0"?>

<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:RDF="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  xmlns:em="http://www.mozilla.org/2004/em-rdf#"
  >
<xsl:output method="xml" indent="yes"/>

<xsl:template match="/">
  <RDF:RDF xmlns:RDF="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:em="http://www.mozilla.org/2004/em-rdf#">
    <xsl:variable name="id" select="RDF:RDF/RDF:Description/em:id"/>
    <xsl:variable name="version" select="RDF:RDF/RDF:Description/em:version"/>
    <RDF:Description about="urn:mozilla:extension:{$id}">
      <em:updates>
        <RDF:Seq>
          <RDF:li>
            <RDF:Description>
              <em:version><xsl:value-of select="$version"/></em:version>
              <xsl:for-each select="RDF:RDF/RDF:Description/em:targetApplication">
                <em:targetApplication>
                  <RDF:Description>
                    <xsl:if test="string-length(RDF:Description/em:id)!=0">
                      <em:id><xsl:value-of select="RDF:Description/em:id"/></em:id>
                    </xsl:if>
                    <xsl:if test="string-length(RDF:Description/em:minVersion)!=0">
                      <em:minVersion><xsl:value-of select="RDF:Description/em:minVersion"/></em:minVersion>
                    </xsl:if>
                    <xsl:if test="string-length(RDF:Description/em:maxVersion)!=0">
                      <em:maxVersion><xsl:value-of select="RDF:Description/em:maxVersion"/></em:maxVersion>
                    </xsl:if>

                    <em:updateLink>https://raw.github.com/friflaj/zotero-better-bibtex/master/<xsl:value-of select="$xpi"/></em:updateLink>

                    <em:updateInfoURL>https://github.com/friflaj/zotero-better-bibtex</em:updateInfoURL>
                  </RDF:Description>
                </em:targetApplication>
              </xsl:for-each>
            </RDF:Description>
          </RDF:li>
        </RDF:Seq>
      </em:updates>
    </RDF:Description>
  </RDF:RDF>
</xsl:template>

</xsl:stylesheet>
