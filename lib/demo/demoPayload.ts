// src/lib/demo/demoPayload.ts

export const OFFLINE_DEMO_INPUT = `Month,Channel,Website_Sessions,Orders,Conversion_Rate,Avg_Order_Value_GBP,Revenue_GBP,Ad_Spend_GBP,Fulfilment_Cost_GBP,Refunds_GBP
Jan,Organic,18500,620,3.35,67.80,42036,0,7800,850
Jan,Paid Search,16200,430,2.65,69.40,29842,9600,6100,720
Jan,Social,13500,190,1.41,64.10,12179,6400,3900,530
Feb,Organic,19200,660,3.44,68.20,45012,0,8200,900
Feb,Paid Search,17100,455,2.66,69.90,31845,10100,6500,760
Feb,Social,13850,210,1.52,65.00,13650,6800,4100,560
Mar,Organic,20100,705,3.51,68.60,48363,0,8600,940
Mar,Paid Search,17800,470,2.64,70.10,32947,10800,6800,790
Mar,Social,14200,225,1.58,65.30,14693,7100,4300,580
Apr,Organic,21200,750,3.54,69.10,51825,0,9000,980
Apr,Paid Search,18600,495,2.66,70.40,34848,11500,7200,820
Apr,Social,14850,240,1.62,65.80,15792,7400,4600,610
May,Organic,22400,795,3.55,69.60,55332,0,9400,1020
May,Paid Search,19400,520,2.68,70.80,36816,12200,7600,850
May,Social,15400,255,1.66,66.20,16881,7700,4900,640
Jun,Organic,23800,845,3.55,70.10,59235,0,9900,1080
Jun,Paid Search,20300,545,2.69,71.20,38794,13000,8000,880
Jun,Social,16000,270,1.69,66.80,18036,8000,5200,670`;

export const OFFLINE_DEMO_EXPLANATION_EN = `
Summary:
Across the six-month period, Organic remains the strongest and most efficient revenue driver, combining the highest conversion rates with zero acquisition cost. Paid Search contributes meaningful incremental volume at a materially higher cost, while Social generates increasing traffic with comparatively weaker conversion performance.

What changed:
- Total revenue increased steadily from January through June, driven primarily by sustained growth in Organic sessions and order volume.
- Paid Search scaled gradually over the period, contributing incremental revenue growth, while average order values remained broadly stable across all channels.

Underlying observations:
- Organic consistently converts above 3.3% across all months, producing the largest share of revenue with no advertising spend.
- Paid Search maintains lower conversion efficiency but delivers reliable scale, with profitability sensitive to rising advertising and fulfilment costs as volume increases.
- Social conversion rates improve modestly over time but remain the lowest of all channels, reinforcing a predominantly top-of-funnel role rather than direct revenue generation.

Why it likely changed:
Revenue growth is best explained by sustained increases in Organic traffic combined with stable conversion efficiency and order values over time. Paid Search contributes incremental volume but experiences diminishing marginal returns as spend increases. No abrupt structural shifts in customer behaviour are evident across the six-month window.

What it means:
- Sustainable profit growth currently depends most on Organic performance, where incremental traffic consistently translates into revenue without additional acquisition cost.
- Paid Search can be used to accelerate growth when carefully controlled, but margin discipline becomes increasingly important as spend scales. Social activity appears better suited to awareness, discovery, and retargeting than primary conversion.

What NOT to conclude:
This analysis does not imply that Paid Search or Social should be reduced or removed, nor that Organic growth will continue indefinitely without investment. While patterns are consistent, the dataset represents a limited timeframe and should not be extrapolated uncritically.

Evidence strength:
High – The dataset is internally consistent across six months, trends are stable rather than erratic, and conclusions are supported by repeated patterns rather than single-period effects.
`.trim();

// ✅ Italian (i18n-style demo copy)
export const OFFLINE_DEMO_EXPLANATION_IT = `
Summary:
Nel periodo di sei mesi, l’Organico resta il motore di ricavi più forte ed efficiente, con i tassi di conversione più alti e zero costi di acquisizione. La Ricerca a Pagamento aggiunge volume in modo significativo ma con costi nettamente superiori, mentre il Social genera traffico in crescita con una conversione relativamente più debole.

What changed:
- I ricavi totali sono aumentati in modo costante da gennaio a giugno, soprattutto grazie alla crescita continua di sessioni e ordini dell’Organico.
- La Ricerca a Pagamento è cresciuta gradualmente, contribuendo in modo incrementale ai ricavi, mentre il valore medio dell’ordine è rimasto complessivamente stabile in tutti i canali.

Underlying observations:
- L’Organico mantiene una conversione superiore al 3,3% in tutti i mesi, generando la quota principale dei ricavi senza spesa pubblicitaria.
- La Ricerca a Pagamento ha una conversione più bassa ma offre una scala affidabile; la redditività è sensibile all’aumento di spesa pubblicitaria e ai costi di evasione man mano che i volumi crescono.
- Il Social migliora leggermente la conversione nel tempo, ma resta il canale meno efficiente, indicando un ruolo prevalentemente “top-of-funnel” piuttosto che di generazione diretta di ricavi.

Why it likely changed:
La crescita dei ricavi è spiegata soprattutto dall’aumento sostenuto del traffico Organico, insieme a conversioni e valori d’ordine stabili nel tempo. La Ricerca a Pagamento aggiunge volume in modo incrementale, ma tende a mostrare rendimenti marginali decrescenti quando la spesa aumenta. Non emergono cambiamenti strutturali improvvisi nel comportamento dei clienti nel periodo di sei mesi.

What it means:
- La crescita profittevole e sostenibile dipende soprattutto dall’Organico, dove l’aumento di traffico si traduce in ricavi senza costi aggiuntivi di acquisizione.
- La Ricerca a Pagamento può accelerare la crescita se ben controllata, ma la disciplina sui margini diventa sempre più importante quando la spesa scala. Il Social appare più adatto ad awareness, scoperta e retargeting che alla conversione primaria.

What NOT to conclude:
Questa analisi non implica che la Ricerca a Pagamento o il Social vadano ridotti o eliminati, né che la crescita dell’Organico continuerà indefinitamente senza investimenti. I pattern sono coerenti, ma il dataset copre un arco temporale limitato e non va extrapolato in modo acritico.

Evidence strength:
High – Il dataset è internamente coerente su sei mesi, i trend sono stabili (non erratici) e le conclusioni sono supportate da pattern ripetuti, non da effetti di un singolo periodo.
`.trim();

export const OFFLINE_DEMO_EXPLANATION_FR = `
Summary:
Sur la période de six mois, l’Organique reste le moteur de revenus le plus puissant et le plus efficace, combinant les meilleurs taux de conversion et un coût d’acquisition nul. La Recherche payante apporte un volume incrémental significatif à un coût nettement plus élevé, tandis que le Social génère un trafic croissant avec une conversion relativement plus faible.

What changed:
- Le chiffre d’affaires total a augmenté régulièrement de janvier à juin, principalement grâce à la croissance continue des sessions et des commandes en Organique.
- La Recherche payante a progressé graduellement sur la période, contribuant à une hausse incrémentale des revenus, tandis que la valeur moyenne de commande est restée globalement stable sur tous les canaux.

Underlying observations:
- L’Organique convertit systématiquement au-dessus de 3,3% chaque mois, produisant la plus grande part des revenus sans dépenses publicitaires.
- La Recherche payante conserve une efficacité de conversion plus faible mais offre une mise à l’échelle fiable; la rentabilité est sensible à la hausse des coûts publicitaires et de préparation/expédition à mesure que le volume augmente.
- Les taux de conversion du Social s’améliorent modestement dans le temps mais restent les plus faibles, renforçant un rôle surtout haut de funnel plutôt qu’une génération directe de revenus.

Why it likely changed:
La croissance des revenus s’explique surtout par des hausses soutenues du trafic Organique, combinées à une efficacité de conversion et des valeurs de commande stables dans le temps. La Recherche payante apporte du volume incrémental mais subit des rendements marginaux décroissants à mesure que la dépense augmente. Aucun changement structurel brutal du comportement client n’apparaît sur la fenêtre de six mois.

What it means:
- La croissance durable du profit dépend actuellement surtout de l’Organique, où le trafic additionnel se transforme régulièrement en revenus sans coût d’acquisition supplémentaire.
- La Recherche payante peut accélérer la croissance si elle est strictement pilotée, mais la discipline sur les marges devient de plus en plus importante à mesure que la dépense augmente. Le Social semble mieux adapté à la notoriété, la découverte et le retargeting qu’à la conversion principale.

What NOT to conclude:
Cette analyse n’implique pas que la Recherche payante ou le Social doivent être réduits ou supprimés, ni que la croissance Organique se poursuivra indéfiniment sans investissement. Les tendances sont cohérentes, mais la période observée est limitée et ne doit pas être extrapolée sans prudence.

Evidence strength:
High – Le jeu de données est cohérent sur six mois, les tendances sont stables plutôt qu’erratiques, et les conclusions reposent sur des motifs répétés plutôt que sur un effet d’un seul mois.
`.trim();

export const OFFLINE_DEMO_EXPLANATION_ES = `
Summary:
Durante el periodo de seis meses, el canal Orgánico sigue siendo el motor de ingresos más fuerte y eficiente, con las tasas de conversión más altas y coste de adquisición cero. La Búsqueda de pago aporta un volumen incremental significativo a un coste mucho mayor, mientras que Social genera tráfico creciente con un rendimiento de conversión comparativamente más débil.

What changed:
- Los ingresos totales aumentaron de forma constante de enero a junio, impulsados principalmente por el crecimiento sostenido de sesiones y pedidos en Orgánico.
- La Búsqueda de pago escaló gradualmente durante el periodo, aportando crecimiento incremental de ingresos, mientras que el valor medio de pedido se mantuvo, en general, estable en todos los canales.

Underlying observations:
- Orgánico convierte consistentemente por encima del 3,3% en todos los meses, generando la mayor parte de los ingresos sin gasto publicitario.
- La Búsqueda de pago mantiene una eficiencia de conversión menor pero ofrece escala fiable; la rentabilidad es sensible al aumento de costes de publicidad y cumplimiento/fulfillment a medida que crece el volumen.
- Las tasas de conversión de Social mejoran modestamente con el tiempo, pero siguen siendo las más bajas, reforzando un papel principalmente de parte alta del embudo más que de generación directa de ingresos.

Why it likely changed:
El crecimiento de ingresos se explica mejor por aumentos sostenidos del tráfico orgánico combinados con una eficiencia de conversión y valores de pedido estables en el tiempo. La Búsqueda de pago añade volumen incremental, pero experimenta rendimientos marginales decrecientes conforme aumenta la inversión. No se observan cambios estructurales bruscos en el comportamiento del cliente en la ventana de seis meses.

What it means:
- El crecimiento sostenible del beneficio depende actualmente sobre todo del rendimiento orgánico, donde el tráfico incremental se traduce de forma consistente en ingresos sin coste adicional de adquisición.
- La Búsqueda de pago puede usarse para acelerar el crecimiento si se controla cuidadosamente, pero la disciplina de márgenes se vuelve cada vez más importante a medida que escala el gasto. La actividad Social parece más adecuada para notoriedad, descubrimiento y retargeting que para conversión principal.

What NOT to conclude:
Este análisis no implica que la Búsqueda de pago o Social deban reducirse o eliminarse, ni que el crecimiento orgánico vaya a continuar indefinidamente sin inversión. Aunque los patrones son consistentes, el conjunto de datos cubre un periodo limitado y no debe extrapolarse sin criterio.

Evidence strength:
High – El dataset es internamente consistente en seis meses, las tendencias son estables y las conclusiones se apoyan en patrones repetidos, no en efectos de un solo periodo.
`.trim();

export const OFFLINE_DEMO_EXPLANATION_DE = `
Summary:
Über den Sechsmonatszeitraum bleibt Organic der stärkste und effizienteste Umsatztreiber: höchste Conversion-Rates bei null Akquisekosten. Paid Search liefert sinnvolles zusätzliches Volumen zu deutlich höheren Kosten, während Social steigenden Traffic erzeugt, jedoch mit vergleichsweise schwächerer Conversion-Performance.

What changed:
- Der Gesamtumsatz stieg von Januar bis Juni kontinuierlich, vor allem durch anhaltendes Wachstum bei Organic-Sessions und Bestellungen.
- Paid Search wurde im Zeitraum schrittweise skaliert und trug inkrementell zum Umsatzwachstum bei; die durchschnittlichen Bestellwerte blieben über alle Kanäle weitgehend stabil.

Underlying observations:
- Organic liegt in allen Monaten konstant über 3,3% Conversion und liefert den größten Umsatzanteil ohne Werbeausgaben.
- Paid Search hat eine geringere Conversion-Effizienz, skaliert jedoch verlässlich; die Profitabilität reagiert empfindlich auf steigende Werbe- und Fulfilment-Kosten bei höherem Volumen.
- Social verbessert die Conversion-Rates leicht über die Zeit, bleibt aber am niedrigsten und bestätigt damit vor allem eine Top-of-Funnel-Rolle statt direkter Umsatzgenerierung.

Why it likely changed:
Das Umsatzwachstum lässt sich am besten durch anhaltende Zuwächse im Organic-Traffic bei stabiler Conversion-Effizienz und stabilen Bestellwerten erklären. Paid Search bringt zusätzliches Volumen, zeigt aber abnehmende Grenzerträge, wenn die Ausgaben steigen. Keine abrupten strukturellen Veränderungen im Kundenverhalten sind im Sechsmonatsfenster erkennbar.

What it means:
- Nachhaltiges Gewinnwachstum hängt aktuell am stärksten von Organic ab, wo zusätzlicher Traffic konsequent in Umsatz übergeht, ohne zusätzliche Akquisekosten.
- Paid Search kann Wachstum beschleunigen, wenn es streng gesteuert wird; mit steigenden Ausgaben wird Margendisziplin wichtiger. Social eignet sich eher für Awareness, Discovery und Retargeting als für primäre Conversion.

What NOT to conclude:
Diese Analyse bedeutet nicht, dass Paid Search oder Social reduziert oder entfernt werden sollten, noch dass Organic ohne Investitionen unbegrenzt weiterwächst. Die Muster sind konsistent, aber der Zeitraum ist begrenzt und sollte nicht unkritisch extrapoliert werden.

Evidence strength:
High – Der Datensatz ist über sechs Monate intern konsistent, die Trends sind stabil statt erratisch, und die Schlussfolgerungen stützen sich auf wiederkehrende Muster statt auf Einmaleffekte.
`.trim();

export const OFFLINE_DEMO_EXPLANATION_PT = `
Summary:
Ao longo do período de seis meses, o Orgânico continua a ser o motor de receita mais forte e eficiente, combinando as maiores taxas de conversão com custo de aquisição zero. A Pesquisa Paga contribui com volume incremental relevante a um custo significativamente maior, enquanto o Social gera tráfego crescente com desempenho de conversão relativamente mais fraco.

What changed:
- A receita total aumentou de forma constante de janeiro a junho, impulsionada principalmente pelo crescimento sustentado de sessões e pedidos no Orgânico.
- A Pesquisa Paga foi escalada gradualmente no período, contribuindo para crescimento incremental de receita, enquanto o valor médio do pedido permaneceu, em geral, estável em todos os canais.

Underlying observations:
- O Orgânico converte consistentemente acima de 3,3% em todos os meses, produzindo a maior parte da receita sem gasto com anúncios.
- A Pesquisa Paga mantém menor eficiência de conversão, mas entrega escala confiável; a rentabilidade é sensível ao aumento de custos de publicidade e fulfillment à medida que o volume cresce.
- As taxas de conversão do Social melhoram modestamente ao longo do tempo, mas continuam as mais baixas, reforçando um papel predominantemente de topo de funil em vez de geração direta de receita.

Why it likely changed:
O crescimento da receita é melhor explicado por aumentos sustentados no tráfego orgânico combinados com eficiência de conversão e valores de pedido estáveis ao longo do tempo. A Pesquisa Paga adiciona volume incremental, mas enfrenta retornos marginais decrescentes conforme o investimento aumenta. Não há mudanças estruturais bruscas no comportamento do cliente neste intervalo de seis meses.

What it means:
- O crescimento sustentável do lucro depende atualmente sobretudo do desempenho do Orgânico, onde o tráfego incremental se traduz de forma consistente em receita sem custo adicional de aquisição.
- A Pesquisa Paga pode acelerar o crescimento quando bem controlada, mas a disciplina de margem torna-se cada vez mais importante à medida que o gasto escala. O Social parece mais adequado para awareness, descoberta e retargeting do que para conversão primária.

What NOT to conclude:
Esta análise não implica que a Pesquisa Paga ou o Social devam ser reduzidos ou removidos, nem que o crescimento orgânico continuará indefinidamente sem investimento. Embora os padrões sejam consistentes, o dataset cobre um período limitado e não deve ser extrapolado sem cautela.

Evidence strength:
High – O dataset é internamente consistente ao longo de seis meses, as tendências são estáveis (não erráticas) e as conclusões são sustentadas por padrões repetidos, não por efeitos de um único período.
`.trim();

export const OFFLINE_DEMO_EXPLANATION_NL = `
Summary:
Over de periode van zes maanden blijft Organic de sterkste en meest efficiënte omzetdriver, met de hoogste conversieratio’s en nul acquisitiekosten. Paid Search levert betekenisvol extra volume tegen duidelijk hogere kosten, terwijl Social toenemend verkeer genereert met relatief zwakkere conversieprestaties.

What changed:
- De totale omzet steeg gestaag van januari tot en met juni, voornamelijk door aanhoudende groei in Organic-sessies en orders.
- Paid Search werd geleidelijk opgeschaald en droeg incrementeel bij aan omzetgroei, terwijl de gemiddelde orderwaarde over alle kanalen grotendeels stabiel bleef.

Underlying observations:
- Organic converteert elke maand consistent boven 3,3% en levert het grootste deel van de omzet zonder advertentiebudget.
- Paid Search heeft een lagere conversie-efficiëntie maar schaalt betrouwbaar; de winstgevendheid is gevoelig voor stijgende advertentie- en fulfilmentkosten naarmate het volume toeneemt.
- Social verbetert de conversieratio’s licht in de tijd, maar blijft het laagst, wat wijst op een vooral top-of-funnel rol in plaats van directe omzetgeneratie.

Why it likely changed:
Omzetgroei is het best te verklaren door aanhoudende stijgingen in organic traffic in combinatie met stabiele conversie-efficiëntie en orderwaarden. Paid Search voegt extra volume toe maar kent afnemende marginale opbrengsten naarmate de spend stijgt. Er zijn geen abrupte structurele veranderingen in klantgedrag zichtbaar binnen dit venster van zes maanden.

What it means:
- Duurzame winstgroei hangt momenteel het meest af van Organic, waar extra traffic consequent doorvertaalt naar omzet zonder extra acquisitiekosten.
- Paid Search kan groei versnellen als het strak wordt gestuurd, maar margediscipline wordt belangrijker naarmate de spend schaalt. Social lijkt beter geschikt voor awareness, discovery en retargeting dan voor primaire conversie.

What NOT to conclude:
Deze analyse betekent niet dat Paid Search of Social moet worden verminderd of verwijderd, noch dat Organic onbeperkt blijft groeien zonder investering. De patronen zijn consistent, maar de periode is beperkt en mag niet kritiekloos worden geëxtrapoleerd.

Evidence strength:
High – De dataset is intern consistent over zes maanden, trends zijn stabiel in plaats van grillig, en conclusies zijn gebaseerd op herhaalde patronen, niet op een enkel periode-effect.
`.trim();

export const OFFLINE_DEMO_EXPLANATION_SV = `
Summary:
Under sexmånadersperioden förblir Organic den starkaste och mest effektiva intäktsdrivaren, med högst konverteringsgrad och noll anskaffningskostnad. Paid Search bidrar med meningsfullt extra volym till en avsevärt högre kostnad, medan Social skapar ökande trafik med relativt svagare konverteringsprestanda.

What changed:
- Total intäkt ökade stadigt från januari till juni, främst drivet av fortsatt tillväxt i Organic-sessioner och ordervolym.
- Paid Search skalade gradvis under perioden och bidrog inkrementellt till intäktstillväxt, samtidigt som genomsnittligt ordervärde var i stort sett stabilt över alla kanaler.

Underlying observations:
- Organic konverterar konsekvent över 3,3% varje månad och står för den största andelen intäkter utan annonskostnad.
- Paid Search har lägre konverteringseffektivitet men levererar pålitlig skala; lönsamheten är känslig för ökande annons- och fulfilmentkostnader när volymen växer.
- Socials konverteringsgrad förbättras något över tid men förblir lägst, vilket förstärker en främst top-of-funnel-roll snarare än direkt intäktsgenerering.

Why it likely changed:
Intäktstillväxten förklaras bäst av ihållande ökningar i organic trafik kombinerat med stabil konverteringseffektivitet och ordervärden över tid. Paid Search ger inkrementell volym men möter avtagande marginalavkastning när spend ökar. Inga plötsliga strukturella skiften i kundbeteende syns under sexmånadersfönstret.

What it means:
- Hållbar vinsttillväxt beror just nu mest på Organic, där extra trafik konsekvent blir intäkt utan extra anskaffningskostnad.
- Paid Search kan användas för att accelerera tillväxt om det kontrolleras noggrant, men marginaldisciplin blir viktigare när spend skalar. Social verkar bättre lämpat för awareness, discovery och retargeting än för primär konvertering.

What NOT to conclude:
Analysen innebär inte att Paid Search eller Social bör minskas eller tas bort, eller att Organic-tillväxt fortsätter obegränsat utan investering. Mönstren är konsekventa, men tidsperioden är begränsad och bör inte extrapoleras okritiskt.

Evidence strength:
High – Datasetet är internt konsekvent över sex månader, trenderna är stabila snarare än ryckiga, och slutsatserna stöds av upprepade mönster snarare än enskilda period-effekter.
`.trim();

export const OFFLINE_DEMO_EXPLANATION_NO = `
Summary:
Over seks måneder forblir Organic den sterkeste og mest effektive inntektsdriveren, med høyest konverteringsrate og null anskaffelseskostnad. Paid Search bidrar med meningsfullt ekstra volum til en vesentlig høyere kostnad, mens Social skaper økende trafikk med relativt svakere konverteringsytelse.

What changed:
- Total omsetning økte jevnt fra januar til juni, primært drevet av vedvarende vekst i Organic-sesjoner og ordrevolum.
- Paid Search ble gradvis skalert i perioden og bidro inkrementelt til omsetningsvekst, mens gjennomsnittlig ordreverdi var stort sett stabil på tvers av kanaler.

Underlying observations:
- Organic konverterer konsekvent over 3,3% hver måned og står for den største delen av omsetningen uten annonsekostnad.
- Paid Search har lavere konverteringseffektivitet, men leverer pålitelig skala; lønnsomheten er følsom for økende annonse- og fulfilmentkostnader når volumet øker.
- Socials konverteringsrater forbedres noe over tid, men forblir lavest, noe som understreker en primært top-of-funnel-rolle fremfor direkte inntektsgenerering.

Why it likely changed:
Omsetningsveksten forklares best av vedvarende økninger i organic trafikk kombinert med stabil konverteringseffektivitet og ordreverdier over tid. Paid Search gir inkrementelt volum, men møter avtagende marginalavkastning når spend øker. Ingen brå strukturelle endringer i kundeadferd er tydelige i seksmånedersvinduet.

What it means:
- Bærekraftig profittvekst avhenger for øyeblikket mest av Organic, der ekstra trafikk konsekvent blir til omsetning uten ekstra anskaffelseskostnad.
- Paid Search kan akselerere vekst når det styres stramt, men margindisiplin blir viktigere når spend skalerer. Social virker bedre egnet for awareness, discovery og retargeting enn for primær konvertering.

What NOT to conclude:
Denne analysen betyr ikke at Paid Search eller Social bør reduseres eller fjernes, eller at Organic-vekst vil fortsette uendelig uten investering. Mønstrene er konsistente, men tidsperioden er begrenset og bør ikke ekstrapoleres ukritisk.

Evidence strength:
High – Datasettet er internt konsistent over seks måneder, trendene er stabile heller enn erratiske, og konklusjonene støttes av gjentatte mønstre fremfor enkeltperiode-effekter.
`.trim();

export const OFFLINE_DEMO_EXPLANATION_DA = `
Summary:
Over seks måneder forbliver Organic den stærkeste og mest effektive omsætningsdriver, med de højeste konverteringsrater og nul anskaffelsesomkostninger. Paid Search bidrager med meningsfuld ekstra volumen til en markant højere omkostning, mens Social skaber stigende trafik med relativt svagere konverteringsperformance.

What changed:
- Den samlede omsætning steg jævnt fra januar til juni, primært drevet af vedvarende vækst i Organic-sessioner og ordrevolumen.
- Paid Search blev gradvist skaleret i perioden og bidrog inkrementelt til omsætningsvækst, mens den gennemsnitlige ordreværdi forblev overordnet stabil på tværs af kanaler.

Underlying observations:
- Organic konverterer konsekvent over 3,3% i alle måneder og leverer den største andel af omsætningen uden annonceforbrug.
- Paid Search har lavere konverteringseffektivitet, men giver pålidelig skala; rentabiliteten er følsom over for stigende annonce- og fulfilmentomkostninger, når volumen øges.
- Socials konverteringsrater forbedres moderat over tid, men forbliver lavest, hvilket understreger en primært top-of-funnel rolle snarere end direkte omsætningsgenerering.

Why it likely changed:
Omsætningsvæksten forklares bedst af vedvarende stigninger i organic trafik kombineret med stabil konverteringseffektivitet og ordreværdier over tid. Paid Search tilfører inkrementel volumen, men oplever faldende marginalafkast, når spend øges. Ingen pludselige strukturelle ændringer i kundeadfærd er tydelige i seksmånedersvinduet.

What it means:
- Bæredygtig profitvækst afhænger i øjeblikket mest af Organic, hvor ekstra trafik konsekvent bliver til omsætning uden ekstra anskaffelsesomkostninger.
- Paid Search kan accelerere vækst, når det styres stramt, men margendisciplin bliver mere vigtig, når spend skalerer. Social virker bedre egnet til awareness, discovery og retargeting end til primær konvertering.

What NOT to conclude:
Denne analyse betyder ikke, at Paid Search eller Social bør reduceres eller fjernes, eller at Organic-vækst vil fortsætte uendeligt uden investering. Mønstrene er konsistente, men tidsperioden er begrænset og bør ikke ekstrapoleres ukritisk.

Evidence strength:
High – Datasættet er internt konsistent over seks måneder, trends er stabile frem for erratiske, og konklusioner er understøttet af gentagne mønstre snarere end enkeltperiode-effekter.
`.trim();

export const OFFLINE_DEMO_EXPLANATION_FI = `
Summary:
Kuuden kuukauden aikana Organic pysyy vahvimpana ja tehokkaimpana tulonlähteenä: korkein konversio ja nolla hankintakustannus. Paid Search tuo merkittävää lisävolyymia selvästi korkeammalla kustannuksella, kun taas Social kasvattaa liikennettä, mutta konversiosuorituskyky on suhteellisesti heikompi.

What changed:
- Kokonaistulot kasvoivat tasaisesti tammikuusta kesäkuuhun, pääosin Organic-istuntojen ja tilausten jatkuvan kasvun ansiosta.
- Paid Search skaalautui vähitellen ja toi inkrementaalista tulokasvua, samalla kun keskimääräinen tilausarvo pysyi yleisesti vakaana kaikissa kanavissa.

Underlying observations:
- Organic konvertoi johdonmukaisesti yli 3,3% joka kuukausi ja tuottaa suurimman osan tuloista ilman mainoskulua.
- Paid Searchin konversio on heikompi, mutta skaala on luotettava; kannattavuus on herkkä mainos- ja fulfilment-kustannusten nousulle volyymin kasvaessa.
- Socialin konversio paranee hieman ajan myötä, mutta pysyy alhaisimpana, mikä tukee roolia pääosin yläfunnelissa eikä suorassa tulonmuodostuksessa.

Why it likely changed:
Tulokasvu selittyy parhaiten organic-liikenteen jatkuvalla kasvulla yhdistettynä vakaaseen konversioeffektiivisyyteen ja tilausarvoihin. Paid Search lisää volyymia, mutta marginaalituotto heikkenee spendin kasvaessa. Kuuden kuukauden aikana ei näy äkillisiä rakenteellisia muutoksia asiakaskäyttäytymisessä.

What it means:
- Kestävä voiton kasvu riippuu tällä hetkellä eniten Organicista, jossa lisäliikenne muuttuu johdonmukaisesti tuloiksi ilman lisähankintakustannusta.
- Paid Search voi kiihdyttää kasvua, jos sitä ohjataan tarkasti, mutta katteiden hallinta korostuu spendin skaalautuessa. Social sopii paremmin tunnettuuteen, löytämiseen ja retargetointiin kuin ensisijaiseen konversioon.

What NOT to conclude:
Tämä analyysi ei tarkoita, että Paid Search tai Social pitäisi vähentää tai poistaa, eikä että Organic-kasvu jatkuisi loputtomasti ilman investointia. Mallit ovat johdonmukaisia, mutta aikajänne on rajallinen eikä sitä pidä ekstrapoloida kritiikittä.

Evidence strength:
High – Aineisto on sisäisesti johdonmukainen kuuden kuukauden ajalta, trendit ovat vakaat eivätkä poukkoile, ja johtopäätökset perustuvat toistuviin kuvioihin eivätkä yksittäisen jakson vaikutuksiin.
`.trim();

export const OFFLINE_DEMO_EXPLANATION_PL = `
Summary:
W okresie sześciu miesięcy Organic pozostaje najsilniejszym i najbardziej efektywnym źródłem przychodu, łącząc najwyższe współczynniki konwersji z zerowym kosztem pozyskania. Paid Search dostarcza istotny dodatkowy wolumen przy znacząco wyższych kosztach, podczas gdy Social generuje rosnący ruch przy relatywnie słabszej konwersji.

What changed:
- Łączne przychody rosły stabilnie od stycznia do czerwca, głównie dzięki utrzymującemu się wzrostowi sesji i liczby zamówień w Organic.
- Paid Search był stopniowo skalowany w tym okresie, dokładając inkrementalny wzrost przychodu, podczas gdy średnia wartość zamówienia pozostawała w dużej mierze stabilna we wszystkich kanałach.

Underlying observations:
- Organic konsekwentnie konwertuje powyżej 3,3% w każdym miesiącu, generując największą część przychodu bez wydatków reklamowych.
- Paid Search ma niższą efektywność konwersji, ale zapewnia wiarygodną skalę; rentowność jest wrażliwa na rosnące koszty reklamy i realizacji (fulfilment) wraz ze wzrostem wolumenu.
- Wskaźniki konwersji w Social poprawiają się nieznacznie w czasie, ale pozostają najniższe, co wzmacnia rolę głównie „top-of-funnel” zamiast bezpośredniego generowania przychodu.

Why it likely changed:
Wzrost przychodu najlepiej tłumaczy trwały wzrost ruchu organicznego przy stabilnej efektywności konwersji i wartościach zamówień w czasie. Paid Search dodaje wolumen inkrementalny, ale doświadcza malejących korzyści krańcowych wraz ze wzrostem wydatków. W horyzoncie sześciu miesięcy nie widać nagłych strukturalnych zmian w zachowaniu klientów.

What it means:
- Zrównoważony wzrost zysku zależy obecnie najbardziej od Organic, gdzie dodatkowy ruch konsekwentnie przekłada się na przychód bez dodatkowego kosztu pozyskania.
- Paid Search może przyspieszać wzrost, jeśli jest ściśle kontrolowany, ale dyscyplina marż staje się coraz ważniejsza wraz ze skalowaniem wydatków. Social wydaje się lepiej dopasowany do świadomości, odkrywania i retargetingu niż do głównej konwersji.

What NOT to conclude:
Ta analiza nie oznacza, że Paid Search lub Social należy ograniczyć lub usunąć, ani że wzrost Organic będzie trwał w nieskończoność bez inwestycji. Wzorce są spójne, ale horyzont czasowy jest ograniczony i nie powinien być bezkrytycznie ekstrapolowany.

Evidence strength:
High – Zbiór danych jest wewnętrznie spójny w skali sześciu miesięcy, trendy są stabilne, a wnioski opierają się na powtarzalnych wzorcach, a nie na efektach jednego okresu.
`.trim();

export const OFFLINE_DEMO_EXPLANATION_TR = `
Summary:
Altı aylık dönemde Organic, en yüksek dönüşüm oranlarını sıfır edinme maliyetiyle birleştirerek en güçlü ve en verimli gelir sürücüsü olmaya devam ediyor. Paid Search, belirgin ölçüde daha yüksek maliyetle anlamlı ek hacim sağlarken, Social daha zayıf dönüşüm performansına kıyasla artan trafik üretiyor.

What changed:
- Toplam gelir Ocak’tan Haziran’a istikrarlı biçimde arttı; bunun ana nedeni Organic oturumlarındaki ve sipariş hacmindeki sürdürülebilir büyüme.
- Paid Search dönem boyunca kademeli olarak ölçeklendi ve gelire artımlı katkı sağladı; ortalama sipariş değerleri ise tüm kanallarda genel olarak stabil kaldı.

Underlying observations:
- Organic, tüm aylarda tutarlı şekilde %3,3’ün üzerinde dönüşüm sağlar ve reklam harcaması olmadan gelirin en büyük bölümünü üretir.
- Paid Search daha düşük dönüşüm verimliliğini korur ancak güvenilir ölçek sunar; hacim arttıkça kârlılık, reklam ve fulfilment maliyetlerindeki artışa duyarlıdır.
- Social dönüşüm oranları zamanla sınırlı ölçüde iyileşse de en düşük seviyede kalır; bu da doğrudan gelir üretiminden ziyade ağırlıklı olarak üst-funnel rolünü güçlendirir.

Why it likely changed:
Gelir artışı en iyi, zaman içinde stabil dönüşüm verimliliği ve sipariş değerleriyle birlikte Organic trafikteki sürekli artışlarla açıklanır. Paid Search artımlı hacim ekler ancak harcama arttıkça azalan marjinal getiriler yaşar. Altı aylık pencerede müşteri davranışında ani yapısal değişimler görünmemektedir.

What it means:
- Sürdürülebilir kâr büyümesi şu anda en çok Organic performansına bağlı; ek trafik ek edinme maliyeti olmadan tutarlı şekilde gelire dönüşüyor.
- Paid Search dikkatle kontrol edilirse büyümeyi hızlandırabilir; ancak harcama ölçeklendikçe marj disiplini daha da kritik hale gelir. Social aktivitesi, birincil dönüşümden ziyade farkındalık, keşif ve yeniden hedefleme için daha uygundur.

What NOT to conclude:
Bu analiz, Paid Search veya Social’ın azaltılması ya da kaldırılması gerektiği anlamına gelmez; aynı şekilde Organic büyümenin yatırım olmadan sonsuza dek süreceğini de söylemez. Desenler tutarlıdır, ancak veri seti sınırlı bir zaman aralığını kapsar ve eleştirel düşünmeden genellenmemelidir.

Evidence strength:
High – Veri seti altı ay boyunca içsel olarak tutarlı, trendler dalgalı değil istikrarlı ve sonuçlar tek bir döneme değil tekrarlayan desenlere dayanıyor.
`.trim();

export const OFFLINE_DEMO_EXPLANATION_EL = `
Summary:
Στην περίοδο των έξι μηνών, το Organic παραμένει ο ισχυρότερος και πιο αποδοτικός οδηγός εσόδων, με τις υψηλότερες μετατροπές και μηδενικό κόστος απόκτησης. Το Paid Search προσθέτει ουσιαστικό επιπλέον όγκο με αισθητά υψηλότερο κόστος, ενώ το Social δημιουργεί αυξανόμενη επισκεψιμότητα με συγκριτικά ασθενέστερη απόδοση μετατροπών.

What changed:
- Τα συνολικά έσοδα αυξήθηκαν σταθερά από τον Ιανουάριο έως τον Ιούνιο, κυρίως λόγω της διατηρούμενης αύξησης των Organic sessions και του όγκου παραγγελιών.
- Το Paid Search κλιμακώθηκε σταδιακά στην περίοδο, συνεισφέροντας σε αυξητικά έσοδα, ενώ οι μέσες αξίες παραγγελίας παρέμειναν σε γενικές γραμμές σταθερές σε όλα τα κανάλια.

Underlying observations:
- Το Organic μετατρέπει σταθερά πάνω από 3,3% σε όλους τους μήνες, παράγοντας το μεγαλύτερο μερίδιο εσόδων χωρίς διαφημιστική δαπάνη.
- Το Paid Search έχει χαμηλότερη αποδοτικότητα μετατροπών αλλά προσφέρει αξιόπιστη κλίμακα· η κερδοφορία είναι ευαίσθητη στην άνοδο διαφημιστικού κόστους και fulfilment καθώς αυξάνεται ο όγκος.
- Τα ποσοστά μετατροπών του Social βελτιώνονται μέτρια με τον χρόνο, αλλά παραμένουν τα χαμηλότερα, ενισχύοντας έναν κυρίως top-of-funnel ρόλο αντί για άμεση δημιουργία εσόδων.

Why it likely changed:
Η αύξηση των εσόδων εξηγείται καλύτερα από τις συνεχιζόμενες αυξήσεις της Organic επισκεψιμότητας σε συνδυασμό με σταθερή αποδοτικότητα μετατροπών και αξίες παραγγελίας. Το Paid Search προσθέτει αυξητικό όγκο, αλλά εμφανίζει φθίνουσες οριακές αποδόσεις όσο αυξάνεται η δαπάνη. Δεν φαίνονται απότομες δομικές αλλαγές στη συμπεριφορά πελατών μέσα στο εξάμηνο.

What it means:
- Η βιώσιμη αύξηση κέρδους εξαρτάται σήμερα περισσότερο από το Organic, όπου η επιπλέον επισκεψιμότητα μετατρέπεται σταθερά σε έσοδα χωρίς πρόσθετο κόστος απόκτησης.
- Το Paid Search μπορεί να επιταχύνει την ανάπτυξη όταν ελέγχεται προσεκτικά, αλλά η πειθαρχία στο περιθώριο γίνεται πιο σημαντική όσο κλιμακώνεται η δαπάνη. Το Social φαίνεται πιο κατάλληλο για awareness, discovery και retargeting παρά για κύρια μετατροπή.

What NOT to conclude:
Αυτή η ανάλυση δεν σημαίνει ότι πρέπει να μειωθούν ή να αφαιρεθούν το Paid Search ή το Social, ούτε ότι η Organic ανάπτυξη θα συνεχιστεί επ’ αόριστον χωρίς επένδυση. Τα μοτίβα είναι συνεπή, αλλά το χρονικό διάστημα είναι περιορισμένο και δεν πρέπει να επεκτείνεται άκριτα.

Evidence strength:
High – Το dataset είναι εσωτερικά συνεπές σε έξι μήνες, οι τάσεις είναι σταθερές και τα συμπεράσματα βασίζονται σε επαναλαμβανόμενα μοτίβα και όχι σε μεμονωμένες περιόδους.
`.trim();

export const OFFLINE_DEMO_EXPLANATION_CS = `
Summary:
Během šesti měsíců zůstává Organic nejsilnějším a nejefektivnějším zdrojem tržeb – kombinuje nejvyšší míry konverze s nulovými akvizičními náklady. Paid Search přináší významný dodatečný objem za podstatně vyšší cenu, zatímco Social generuje rostoucí návštěvnost s relativně slabší konverzí.

What changed:
- Celkové tržby rostly stabilně od ledna do června, hlavně díky trvalému růstu Organic návštěv a objemu objednávek.
- Paid Search se v průběhu období postupně škáloval a přispíval inkrementálně k růstu tržeb, zatímco průměrné hodnoty objednávek zůstaly napříč kanály převážně stabilní.

Underlying observations:
- Organic se konzistentně drží nad 3,3% konverze ve všech měsících a vytváří největší podíl tržeb bez reklamních výdajů.
- Paid Search má nižší konverzní efektivitu, ale nabízí spolehlivou škálu; ziskovost je citlivá na růst nákladů na reklamu a fulfilment s rostoucím objemem.
- Konverzní míry Social se v čase mírně zlepšují, ale zůstávají nejnižší, což potvrzuje převážně top-of-funnel roli spíše než přímou tvorbu tržeb.

Why it likely changed:
Růst tržeb nejlépe vysvětluje trvalý nárůst Organic návštěvnosti při stabilní konverzní efektivitě a hodnotách objednávek. Paid Search přidává inkrementální objem, ale s rostoucími výdaji čelí klesajícím mezním výnosům. V průběhu šesti měsíců nejsou patrné náhlé strukturální změny chování zákazníků.

What it means:
- Udržitelný růst zisku nyní závisí především na Organic, kde se dodatečná návštěvnost konzistentně proměňuje v tržby bez dalších akvizičních nákladů.
- Paid Search může urychlit růst, pokud je pečlivě řízen, ale disciplína marže je stále důležitější, jak se výdaje škálují. Social se zdá vhodnější pro povědomí, objevování a retargeting než pro primární konverzi.

What NOT to conclude:
Tato analýza neznamená, že by se Paid Search nebo Social měly omezit či odstranit, ani že Organic růst bude pokračovat donekonečna bez investic. Vzorce jsou konzistentní, ale období je omezené a nemělo by se nekriticky extrapolovat.

Evidence strength:
High – Dataset je v rámci šesti měsíců interně konzistentní, trendy jsou stabilní a závěry stojí na opakovaných vzorcích, nikoli na jednorázových efektech.
`.trim();

export const OFFLINE_DEMO_EXPLANATION_HU = `
Summary:
A hat hónapos időszakban az Organic továbbra is a legerősebb és leghatékonyabb bevételi csatorna: a legmagasabb konverziót nullás ügyfélszerzési költséggel párosítja. A Paid Search érdemi többletvolument hoz, lényegesen magasabb költségek mellett, míg a Social növekvő forgalmat generál, de relatíve gyengébb konverziós teljesítménnyel.

What changed:
- Az összbevétel januártól júniusig egyenletesen nőtt, elsősorban az Organic sessionök és rendelési volumen tartós bővülése miatt.
- A Paid Search fokozatosan skálázódott a periódusban, inkrementálisan hozzájárulva a bevételnövekedéshez, miközben az átlagos rendelési érték csatornák között nagyjából stabil maradt.

Underlying observations:
- Az Organic minden hónapban következetesen 3,3% felett konvertál, és hirdetési költés nélkül termeli a bevétel legnagyobb részét.
- A Paid Search alacsonyabb konverziós hatékonyságot tart, de megbízható skálát ad; a profitabilitás érzékeny a növekvő hirdetési és fulfilment költségekre, ahogy nő a volumen.
- A Social konverziós rátái idővel mérsékelten javulnak, de továbbra is a legalacsonyabbak, ami inkább top-of-funnel szerepet erősít, nem pedig közvetlen bevételtermelést.

Why it likely changed:
A bevételnövekedés leginkább az Organic forgalom tartós növekedésével magyarázható, stabil konverziós hatékonysággal és rendelési értékekkel. A Paid Search inkrementális volument ad, de a költés növekedésével csökkenő határhozamok jelentkeznek. A hat hónapban nem láthatók hirtelen szerkezeti változások az ügyfélviselkedésben.

What it means:
- A fenntartható profitnövekedés jelenleg leginkább az Organic teljesítményétől függ, ahol a többletforgalom következetesen bevétellé alakul extra akvizíciós költség nélkül.
- A Paid Search gyorsíthatja a növekedést, ha szorosan kontrollált, de a marzs fegyelme egyre fontosabb a költés skálázásával. A Social inkább ismertségre, felfedezésre és retargetingre alkalmas, mint elsődleges konverzióra.

What NOT to conclude:
Ez az elemzés nem jelenti azt, hogy a Paid Search vagy a Social csökkentendő vagy megszüntetendő, és azt sem, hogy az Organic növekedés beruházás nélkül a végtelenségig tart. A minták következetesek, de az időtáv korlátozott, ezért nem szabad kritikátlanul kivetíteni.

Evidence strength:
High – Az adatállomány hat hónapon át belsőleg konzisztens, a trendek stabilak, és a következtetések ismétlődő mintákon alapulnak, nem egyetlen időszak hatásán.
`.trim();

export const OFFLINE_DEMO_EXPLANATION_RO = `
Summary:
Pe parcursul celor șase luni, Organic rămâne cel mai puternic și eficient motor de venituri, combinând cele mai mari rate de conversie cu cost de achiziție zero. Paid Search contribuie cu volum incremental semnificativ la un cost material mai ridicat, în timp ce Social generează trafic în creștere, dar cu performanță de conversie comparativ mai slabă.

What changed:
- Veniturile totale au crescut constant din ianuarie până în iunie, în principal datorită creșterii susținute a sesiunilor Organic și a volumului de comenzi.
- Paid Search a fost scalat treptat în perioadă, contribuind incremental la creșterea veniturilor, în timp ce valoarea medie a comenzii a rămas, în linii mari, stabilă pe toate canalele.

Underlying observations:
- Organic convertește constant peste 3,3% în toate lunile, generând cea mai mare parte a veniturilor fără cheltuieli de publicitate.
- Paid Search are eficiență de conversie mai mică, dar oferă scalare fiabilă; profitabilitatea este sensibilă la creșterea costurilor de publicitate și fulfilment pe măsură ce volumul crește.
- Ratele de conversie din Social se îmbunătățesc modest în timp, dar rămân cele mai mici, consolidând un rol predominant top-of-funnel, mai degrabă decât generare directă de venit.

Why it likely changed:
Creșterea veniturilor este explicată cel mai bine de creșteri susținute ale traficului Organic combinate cu eficiență de conversie și valori ale comenzilor stabile în timp. Paid Search adaugă volum incremental, dar experimentează randamente marginale în scădere pe măsură ce cheltuiala crește. Nu sunt evidente schimbări structurale bruște în comportamentul clienților în fereastra de șase luni.

What it means:
- Creșterea sustenabilă a profitului depinde în prezent cel mai mult de Organic, unde traficul incremental se transformă consecvent în venit fără cost suplimentar de achiziție.
- Paid Search poate accelera creșterea dacă este controlat atent, dar disciplina de marjă devine tot mai importantă pe măsură ce cheltuiala se scalează. Social pare mai potrivit pentru awareness, descoperire și retargeting decât pentru conversie primară.

What NOT to conclude:
Această analiză nu implică reducerea sau eliminarea Paid Search ori Social, nici faptul că creșterea Organic va continua la nesfârșit fără investiții. Deși tiparele sunt consecvente, intervalul este limitat și nu ar trebui extrapolat necritic.

Evidence strength:
High – Datasetul este intern consecvent pe șase luni, tendințele sunt stabile, iar concluziile sunt susținute de tipare repetate, nu de efecte dintr-o singură perioadă.
`.trim();

export const OFFLINE_DEMO_EXPLANATION_UK = `
Summary:
Протягом шести місяців Organic залишається найсильнішим і найефективнішим драйвером доходу, поєднуючи найвищі показники конверсії з нульовою вартістю залучення. Paid Search дає суттєвий додатковий обсяг за значно вищої вартості, тоді як Social генерує зростаючий трафік із порівняно слабшою конверсією.

What changed:
- Загальний дохід стабільно зростав з січня до червня, передусім завдяки сталому зростанню Organic-сесій і обсягу замовлень.
- Paid Search поступово масштабувався протягом періоду, роблячи інкрементальний внесок у зростання доходу, тоді як середня вартість замовлення загалом залишалась стабільною в усіх каналах.

Underlying observations:
- Organic стабільно конвертує вище 3,3% у всі місяці, формуючи найбільшу частку доходу без рекламних витрат.
- Paid Search має нижчу ефективність конверсії, але забезпечує надійне масштабування; прибутковість чутлива до зростання рекламних і fulfilment-витрат зі збільшенням обсягу.
- Конверсія Social помірно покращується з часом, але залишається найнижчою, підкреслюючи роль переважно top-of-funnel, а не прямого генерування доходу.

Why it likely changed:
Зростання доходу найкраще пояснюється сталим збільшенням Organic-трафіку в поєднанні зі стабільною ефективністю конверсії та стабільними значеннями середнього чека. Paid Search додає інкрементальний обсяг, але зі зростанням витрат стикається зі спадною граничною віддачею. Протягом шести місяців не видно різких структурних змін у поведінці клієнтів.

What it means:
- Стійке зростання прибутку зараз найбільше залежить від Organic, де додатковий трафік послідовно перетворюється на дохід без додаткової вартості залучення.
- Paid Search може прискорювати зростання за умови жорсткого контролю, але дисципліна маржі стає дедалі важливішою зі масштабуванням витрат. Social виглядає більш придатним для обізнаності, відкриття та ретаргетингу, ніж для основної конверсії.

What NOT to conclude:
Цей аналіз не означає, що Paid Search або Social потрібно зменшувати чи прибирати, і не гарантує, що Organic-зростання триватиме безкінечно без інвестицій. Хоча патерни узгоджені, часовий горизонт обмежений і не має екстраполюватися без критичної оцінки.

Evidence strength:
High – Дані внутрішньо узгоджені в межах шести місяців, тренди стабільні, а висновки спираються на повторювані патерни, а не на ефекти одного періоду.
`.trim();

export const OFFLINE_DEMO_EXPLANATION_RU = `
Summary:
За шестимесячный период Organic остаётся самым сильным и эффективным драйвером выручки, сочетая самые высокие конверсии с нулевой стоимостью привлечения. Paid Search даёт значимый дополнительный объём при существенно более высокой стоимости, тогда как Social генерирует растущий трафик с сравнительно более слабой конверсией.

What changed:
- Общая выручка стабильно росла с января по июнь, главным образом за счёт устойчивого роста Organic-сессий и объёма заказов.
- Paid Search постепенно масштабировался в течение периода, внося инкрементальный вклад в рост выручки, при этом средняя стоимость заказа в целом оставалась стабильной по всем каналам.

Underlying observations:
- Organic стабильно конвертирует выше 3,3% во всех месяцах и формирует наибольшую долю выручки без рекламных затрат.
- Paid Search имеет более низкую эффективность конверсии, но обеспечивает надёжную масштабируемость; прибыльность чувствительна к росту рекламных и fulfilment-расходов по мере увеличения объёма.
- Конверсия Social умеренно улучшается со временем, но остаётся самой низкой, подчёркивая роль преимущественно верхней части воронки, а не прямой генерации выручки.

Why it likely changed:
Рост выручки лучше всего объясняется устойчивым увеличением organic-трафика в сочетании со стабильной эффективностью конверсии и значениями среднего чека. Paid Search добавляет инкрементальный объём, но сталкивается с убывающей предельной отдачей по мере роста расходов. За шестимесячное окно не видно резких структурных изменений в поведении клиентов.

What it means:
- Устойчивый рост прибыли сейчас больше всего зависит от Organic, где дополнительный трафик последовательно превращается в выручку без дополнительных затрат на привлечение.
- Paid Search может ускорять рост при строгом контроле, но дисциплина по марже становится всё важнее по мере масштабирования расходов. Social больше подходит для узнаваемости, discovery и ретаргетинга, чем для основной конверсии.

What NOT to conclude:
Этот анализ не означает, что Paid Search или Social следует сокращать или убирать, и не утверждает, что рост Organic будет продолжаться бесконечно без инвестиций. Хотя закономерности устойчивы, период ограничен и не должен экстраполироваться без критической оценки.

Evidence strength:
High – Датасет внутренне согласован на протяжении шести месяцев, тренды стабильны, а выводы опираются на повторяющиеся паттерны, а не на эффекты одного периода.
`.trim();

// ✅ RTL (Arabic, Hebrew, Urdu)
export const OFFLINE_DEMO_EXPLANATION_AR = `
Summary:
على مدار ستة أشهر، يظل Organic أقوى وأكثر محركٍ للإيرادات كفاءةً، إذ يجمع بين أعلى معدلات التحويل وتكلفة اكتساب صفرية. يضيف Paid Search حجمًا إضافيًا مهمًا لكن بتكلفة أعلى بشكل ملحوظ، بينما يولّد Social زيارات متزايدة مع أداء تحويل أضعف نسبيًا.

What changed:
- ارتفعت الإيرادات الإجمالية بشكل ثابت من يناير إلى يونيو، مدفوعةً أساسًا بالنمو المستمر في جلسات Organic وحجم الطلبات.
- تم توسيع Paid Search تدريجيًا خلال الفترة، مساهمًا في نموٍ تدريجي للإيرادات، بينما بقي متوسط قيمة الطلب مستقرًا عمومًا عبر جميع القنوات.

Underlying observations:
- يحافظ Organic على معدل تحويل أعلى من 3.3% باستمرار في جميع الأشهر، وينتج أكبر حصة من الإيرادات دون إنفاق إعلاني.
- يتمتع Paid Search بكفاءة تحويل أقل لكنه يوفر قابلية توسّع موثوقة؛ وتكون الربحية حساسة لارتفاع تكاليف الإعلان والـ fulfilment مع زيادة الحجم.
- تتحسن معدلات تحويل Social بشكل طفيف مع الوقت لكنها تبقى الأدنى بين القنوات، ما يعزز دوره كقناة أعلى القمع أكثر من كونه توليدًا مباشرًا للإيرادات.

Why it likely changed:
يمكن تفسير نمو الإيرادات بشكل أفضل عبر الزيادات المستمرة في حركة Organic مع ثبات كفاءة التحويل وقيم الطلب بمرور الوقت. يضيف Paid Search حجمًا إضافيًا لكنه يواجه عوائد هامشية متناقصة كلما زاد الإنفاق. لا تظهر تغيّرات هيكلية مفاجئة في سلوك العملاء ضمن نافذة الأشهر الستة.

What it means:
- يعتمد نمو الأرباح المستدام حاليًا بدرجة أكبر على أداء Organic، حيث يتحول النمو في الزيارات إلى إيرادات بشكل متّسق دون تكلفة اكتساب إضافية.
- يمكن استخدام Paid Search لتسريع النمو عند التحكم به بعناية، لكن الانضباط في الهوامش يصبح أكثر أهمية مع توسّع الإنفاق. يبدو Social أكثر ملاءمة للوعي والاكتشاف وإعادة الاستهداف من كونه قناة تحويل أساسية.

What NOT to conclude:
لا تعني هذه القراءة أنه يجب تقليل Paid Search أو Social أو إزالتهما، ولا أنها تؤكد استمرار نمو Organic إلى ما لا نهاية دون استثمار. الأنماط متسقة، لكن الفترة الزمنية محدودة ولا ينبغي تعميمها دون حذر.

Evidence strength:
High – مجموعة البيانات متسقة داخليًا عبر ستة أشهر، والاتجاهات مستقرة وليست متقلبة، والاستنتاجات مدعومة بأنماط متكررة لا بتأثير فترة واحدة.
`.trim();

export const OFFLINE_DEMO_EXPLANATION_HE = `
Summary:
במהלך שישה חודשים, Organic נשאר מנוע ההכנסות החזק והיעיל ביותר, עם שיעורי ההמרה הגבוהים ביותר ועלות רכישה אפסית. Paid Search מוסיף נפח משמעותי אך בעלות גבוהה בהרבה, בעוד Social מייצר תנועה הולכת וגדלה עם ביצועי המרה חלשים יותר יחסית.

What changed:
- סך ההכנסות עלה באופן עקבי מינואר עד יוני, בעיקר בזכות צמיחה מתמשכת בסשנים ובנפח ההזמנות של Organic.
- Paid Search הוגדל בהדרגה לאורך התקופה ותרם לצמיחה אינקרמנטלית בהכנסות, בעוד שערכי ההזמנה הממוצעים נותרו ברובם יציבים בכל הערוצים.

Underlying observations:
- Organic ממיר באופן עקבי מעל 3.3% בכל החודשים ומייצר את חלק הארי של ההכנסות ללא הוצאות פרסום.
- ל-Paid Search יעילות המרה נמוכה יותר, אך הוא מספק סקייל אמין; הרווחיות רגישה לעלייה בעלויות פרסום ו-fulfilment ככל שהנפח גדל.
- שיעורי ההמרה של Social משתפרים מעט עם הזמן אך נשארים הנמוכים ביותר, מה שמחזק תפקיד בעיקר טופ-אוף-פאנל ולא יצירת הכנסה ישירה.

Why it likely changed:
צמיחת ההכנסות מוסברת בצורה הטובה ביותר על ידי עלייה מתמשכת בתנועת Organic לצד יציבות ביעילות ההמרה ובערכי ההזמנה לאורך זמן. Paid Search מוסיף נפח אינקרמנטלי אך חווה תשואה שולית פוחתת ככל שההוצאה גדלה. אין עדות לשינויים מבניים חדים בהתנהגות הלקוחות בחלון של שישה חודשים.

What it means:
- צמיחת רווח בת-קיימא תלויה כיום בעיקר בביצועי Organic, שבהם תנועה נוספת מתורגמת בעקביות להכנסות ללא עלות רכישה נוספת.
- Paid Search יכול להאיץ צמיחה כאשר הוא מנוהל בקפידה, אך משמעת מרווחים נעשית חשובה יותר ככל שההוצאה גדלה. Social נראה מתאים יותר למודעות, גילוי וריטרגטינג מאשר להמרה ראשית.

What NOT to conclude:
הניתוח אינו אומר שצריך לצמצם או להסיר Paid Search או Social, וגם לא שהצמיחה האורגנית תימשך ללא סוף ללא השקעה. הדפוסים עקביים, אך התקופה מוגבלת ואין להסיק ממנה באופן בלתי ביקורתי.

Evidence strength:
High – מערך הנתונים עקבי פנימית לאורך שישה חודשים, המגמות יציבות ולא תנודתיות, והמסקנות נשענות על דפוסים חוזרים ולא על השפעה של תקופה אחת.
`.trim();

export const OFFLINE_DEMO_EXPLANATION_UR = `
Summary:
چھ ماہ کے عرصے میں Organic سب سے مضبوط اور مؤثر ریونیو ڈرائیور رہا، کیونکہ اس کی کنورژن ریٹس سب سے زیادہ ہیں اور حصولِ صارف کی لاگت صفر ہے۔ Paid Search نمایاں اضافی حجم دیتا ہے لیکن کافی زیادہ لاگت پر، جبکہ Social بڑھتا ہوا ٹریفک پیدا کرتا ہے مگر نسبتاً کمزور کنورژن کارکردگی کے ساتھ۔

What changed:
- جنوری سے جون تک کل ریونیو مسلسل بڑھا، جس کی بنیادی وجہ Organic سیشنز اور آرڈر والیوم میں مسلسل اضافہ تھا۔
- Paid Search کو اس عرصے میں بتدریج اسکیل کیا گیا، جس سے ریونیو میں اضافی (incremental) اضافہ ہوا، جبکہ اوسط آرڈر ویلیو مجموعی طور پر تمام چینلز میں کافی حد تک مستحکم رہی۔

Underlying observations:
- Organic تمام مہینوں میں مستقل طور پر 3.3% سے اوپر کنورٹ کرتا ہے اور بغیر اشتہاری خرچ کے ریونیو کا سب سے بڑا حصہ پیدا کرتا ہے۔
- Paid Search کی کنورژن ایفیشنسی کم ہے مگر اسکیل قابلِ اعتماد ہے؛ حجم بڑھنے کے ساتھ منافع اشتہاری اور fulfilment لاگتوں کے بڑھنے کے لیے حساس ہے۔
- Social کی کنورژن ریٹس وقت کے ساتھ معمولی بہتر ہوتی ہیں مگر سب سے کم رہتی ہیں، جس سے اس کا کردار زیادہ تر top-of-funnel ثابت ہوتا ہے نہ کہ براہِ راست ریونیو جنریشن۔

Why it likely changed:
ریونیو میں اضافہ بہترین طور پر Organic ٹریفک میں مسلسل اضافے اور وقت کے ساتھ کنورژن ایفیشنسی اور آرڈر ویلیوز کے مستحکم رہنے سے سمجھ آتا ہے۔ Paid Search اضافی حجم دیتا ہے مگر جیسے جیسے spend بڑھتا ہے ویسے ویسے marginal returns کم ہوتے جاتے ہیں۔ چھ ماہ کے ونڈو میں صارفین کے رویّے میں کوئی اچانک ساختی تبدیلی واضح نہیں۔

What it means:
- پائیدار منافع کی بڑھوتری فی الحال زیادہ تر Organic پر منحصر ہے، جہاں اضافی ٹریفک بغیر اضافی حصولِ صارف لاگت کے مستقل طور پر ریونیو میں بدلتا ہے۔
- Paid Search کو احتیاط سے کنٹرول کر کے growth تیز کی جا سکتی ہے، مگر spend اسکیل ہونے کے ساتھ margin discipline زیادہ اہم ہو جاتی ہے۔ Social زیادہ تر awareness، discovery اور retargeting کے لیے موزوں لگتا ہے نہ کہ primary conversion کے لیے۔

What NOT to conclude:
یہ تجزیہ اس بات کی دلیل نہیں کہ Paid Search یا Social کو کم یا ختم کر دیا جائے، اور نہ ہی یہ کہ Organic growth بغیر سرمایہ کاری کے ہمیشہ جاری رہے گی۔ پیٹرنز مستقل ہیں، مگر ڈیٹا کی مدت محدود ہے اور اسے بغیر تنقیدی سوچ کے آگے نہیں بڑھانا چاہیے۔

Evidence strength:
High – ڈیٹاسیٹ چھ ماہ میں اندرونی طور پر ہم آہنگ ہے، رجحانات مستحکم ہیں، اور نتائج ایک ہی مدت کے اثر کے بجائے بار بار آنے والے پیٹرنز سے سپورٹ ہوتے ہیں۔
`.trim();

export const OFFLINE_DEMO_EXPLANATION_HI = `
Summary:
छह महीनों की अवधि में Organic सबसे मजबूत और सबसे कुशल राजस्व स्रोत बना रहता है, क्योंकि इसमें सबसे उच्च कन्वर्ज़न दरें और शून्य अधिग्रहण लागत होती है। Paid Search अपेक्षाकृत अधिक लागत पर सार्थक अतिरिक्त वॉल्यूम देता है, जबकि Social बढ़ता हुआ ट्रैफ़िक लाता है लेकिन कन्वर्ज़न प्रदर्शन तुलनात्मक रूप से कमजोर रहता है।

What changed:
- कुल राजस्व जनवरी से जून तक लगातार बढ़ा, मुख्यतः Organic sessions और ऑर्डर वॉल्यूम में स्थायी वृद्धि के कारण।
- Paid Search को धीरे-धीरे स्केल किया गया, जिससे राजस्व में incremental वृद्धि हुई, जबकि औसत ऑर्डर वैल्यू सभी चैनलों में कुल मिलाकर स्थिर रही।

Underlying observations:
- Organic हर महीने लगातार 3.3% से ऊपर कन्वर्ट करता है और बिना विज्ञापन खर्च के राजस्व का सबसे बड़ा हिस्सा पैदा करता है।
- Paid Search की कन्वर्ज़न दक्षता कम है, लेकिन यह भरोसेमंद स्केल देता है; जैसे-जैसे वॉल्यूम बढ़ता है, लाभप्रदता विज्ञापन और fulfilment लागतों के बढ़ने के प्रति संवेदनशील होती है।
- Social की कन्वर्ज़न दरें समय के साथ थोड़ा बेहतर होती हैं, लेकिन सबसे कम रहती हैं, जिससे इसका रोल मुख्यतः top-of-funnel बनाम सीधे राजस्व निर्माण को दर्शाता है।

Why it likely changed:
राजस्व वृद्धि का सबसे अच्छा कारण Organic ट्रैफ़िक में निरंतर वृद्धि है, साथ ही समय के साथ कन्वर्ज़न दक्षता और ऑर्डर वैल्यू का स्थिर रहना। Paid Search incremental वॉल्यूम जोड़ता है, लेकिन spend बढ़ने पर diminishing marginal returns दिखता है। छह महीनों की अवधि में ग्राहक व्यवहार में कोई अचानक संरचनात्मक बदलाव स्पष्ट नहीं है।

What it means:
- टिकाऊ लाभ वृद्धि अभी सबसे अधिक Organic प्रदर्शन पर निर्भर है, जहाँ अतिरिक्त ट्रैफ़िक बिना अतिरिक्त अधिग्रहण लागत के लगातार राजस्व में बदलता है।
- Paid Search को सावधानी से नियंत्रित करके ग्रोथ तेज़ की जा सकती है, लेकिन spend स्केल होने पर margin discipline अधिक महत्वपूर्ण हो जाती है। Social मुख्य कन्वर्ज़न की तुलना में awareness, discovery और retargeting के लिए अधिक उपयुक्त दिखता है।

What NOT to conclude:
यह विश्लेषण यह नहीं कहता कि Paid Search या Social को घटाया या हटाया जाए, और न ही यह कि Organic ग्रोथ बिना निवेश के अनिश्चितकाल तक जारी रहेगी। पैटर्न स्थिर हैं, लेकिन समय-सीमा सीमित है और इसे बिना आलोचनात्मक सोच के extrapolate नहीं करना चाहिए।

Evidence strength:
High – डेटासेट छह महीनों में आंतरिक रूप से संगत है, ट्रेंड स्थिर हैं, और निष्कर्ष एक ही अवधि के प्रभाव के बजाय दोहराए गए पैटर्न से समर्थित हैं।
`.trim();

export const OFFLINE_DEMO_EXPLANATION_BN = `
Summary:
ছয় মাসের সময়ে Organic সবচেয়ে শক্তিশালী ও সবচেয়ে কার্যকর রাজস্ব চালক হিসেবে থাকে—উচ্চতম কনভার্সন রেট এবং শূন্য অধিগ্রহণ খরচের সমন্বয়ে। Paid Search উল্লেখযোগ্য অতিরিক্ত ভলিউম দেয়, তবে অনেক বেশি খরচে; আর Social ক্রমবর্ধমান ট্র্যাফিক আনে, কিন্তু তুলনামূলকভাবে দুর্বল কনভার্সন পারফরম্যান্সসহ।

What changed:
- জানুয়ারি থেকে জুন পর্যন্ত মোট রাজস্ব ধারাবাহিকভাবে বেড়েছে, প্রধানত Organic সেশন ও অর্ডার ভলিউমের স্থায়ী বৃদ্ধির কারণে।
- Paid Search ধীরে ধীরে স্কেল করা হয়েছে, ফলে রাজস্ব বৃদ্ধি পেয়েছে ইনক্রিমেন্টালি; একই সময়ে গড় অর্ডার ভ্যালু সব চ্যানেলে মোটামুটি স্থিতিশীল ছিল।

Underlying observations:
- Organic সব মাসেই 3.3% এর ওপর ধারাবাহিকভাবে কনভার্ট করে এবং বিজ্ঞাপন খরচ ছাড়াই রাজস্বের সবচেয়ে বড় অংশ তৈরি করে।
- Paid Search-এর কনভার্সন দক্ষতা কম, তবে স্কেল নির্ভরযোগ্য; ভলিউম বাড়ার সঙ্গে বিজ্ঞাপন ও fulfilment খরচ বাড়লে লাভজনকতা সংবেদনশীল হয়।
- Social-এর কনভার্সন রেট সময়ের সাথে অল্প উন্নত হলেও সর্বনিম্নই থাকে, যা সরাসরি রাজস্বের চেয়ে top-of-funnel ভূমিকাই বেশি নির্দেশ করে।

Why it likely changed:
রাজস্ব বৃদ্ধির সবচেয়ে যুক্তিযুক্ত ব্যাখ্যা হলো Organic ট্র্যাফিকের ধারাবাহিক বৃদ্ধি, সাথে কনভার্সন দক্ষতা ও অর্ডার ভ্যালুর স্থিতিশীলতা। Paid Search অতিরিক্ত ভলিউম যোগ করলেও spend বাড়ার সাথে diminishing marginal returns দেখা যায়। ছয় মাসে গ্রাহক আচরণে হঠাৎ কোনো কাঠামোগত পরিবর্তন স্পষ্ট নয়।

What it means:
- টেকসই লাভ বৃদ্ধি বর্তমানে সবচেয়ে বেশি Organic পারফরম্যান্সের ওপর নির্ভর করে, যেখানে অতিরিক্ত ট্র্যাফিক বাড়তি অধিগ্রহণ খরচ ছাড়াই ধারাবাহিকভাবে রাজস্ব হয়ে ওঠে।
- Paid Search সতর্ক নিয়ন্ত্রণে গ্রোথ দ্রুত করতে পারে, তবে spend স্কেল হলে মার্জিন ডিসিপ্লিন আরও গুরুত্বপূর্ণ হয়। Social মূল কনভার্সনের চেয়ে awareness, discovery ও retargeting-এর জন্য বেশি উপযোগী।

What NOT to conclude:
এই বিশ্লেষণ বলে না যে Paid Search বা Social কমানো বা বন্ধ করা উচিত, বা Organic গ্রোথ বিনিয়োগ ছাড়াই অনির্দিষ্টকাল চলবে। প্যাটার্নগুলো সঙ্গতিপূর্ণ, তবে সময়কাল সীমিত এবং একে অন্ধভাবে extrapolate করা উচিত নয়।

Evidence strength:
High – ডেটাসেট ছয় মাস জুড়ে অভ্যন্তরীণভাবে সঙ্গতিপূর্ণ, ট্রেন্ড স্থিতিশীল, এবং সিদ্ধান্তগুলো একক সময়ের প্রভাব নয়, বরং পুনরাবৃত্ত প্যাটার্নের ওপর ভিত্তি করে।
`.trim();

export const OFFLINE_DEMO_EXPLANATION_ID = `
Summary:
Selama periode enam bulan, Organic tetap menjadi pendorong pendapatan paling kuat dan efisien, menggabungkan tingkat konversi tertinggi dengan biaya akuisisi nol. Paid Search memberikan volume tambahan yang bermakna dengan biaya yang jauh lebih tinggi, sementara Social menghasilkan trafik yang meningkat dengan kinerja konversi yang relatif lebih lemah.

What changed:
- Total pendapatan meningkat stabil dari Januari hingga Juni, terutama didorong oleh pertumbuhan berkelanjutan pada sesi Organic dan volume pesanan.
- Paid Search ditingkatkan secara bertahap selama periode tersebut, berkontribusi pada pertumbuhan pendapatan secara incremental, sementara nilai pesanan rata-rata relatif stabil di semua channel.

Underlying observations:
- Organic secara konsisten mengonversi di atas 3,3% setiap bulan, menghasilkan porsi pendapatan terbesar tanpa belanja iklan.
- Paid Search memiliki efisiensi konversi yang lebih rendah tetapi memberikan skala yang andal; profitabilitas sensitif terhadap kenaikan biaya iklan dan fulfilment saat volume meningkat.
- Tingkat konversi Social membaik sedikit seiring waktu tetapi tetap yang terendah, menegaskan peran terutama top-of-funnel daripada menghasilkan pendapatan langsung.

Why it likely changed:
Pertumbuhan pendapatan paling baik dijelaskan oleh kenaikan berkelanjutan pada trafik Organic yang dikombinasikan dengan efisiensi konversi dan nilai pesanan yang stabil dari waktu ke waktu. Paid Search menambahkan volume incremental namun mengalami penurunan marginal returns saat belanja meningkat. Tidak terlihat perubahan struktural yang tiba-tiba pada perilaku pelanggan dalam jendela enam bulan.

What it means:
- Pertumbuhan profit yang berkelanjutan saat ini paling bergantung pada kinerja Organic, di mana trafik tambahan secara konsisten berubah menjadi pendapatan tanpa biaya akuisisi tambahan.
- Paid Search dapat digunakan untuk mempercepat pertumbuhan jika dikendalikan dengan ketat, tetapi disiplin margin menjadi semakin penting saat belanja meningkat. Social tampak lebih cocok untuk awareness, discovery, dan retargeting dibanding konversi utama.

What NOT to conclude:
Analisis ini tidak menyiratkan bahwa Paid Search atau Social harus dikurangi atau dihapus, atau bahwa pertumbuhan Organic akan terus berlanjut tanpa batas tanpa investasi. Polanya konsisten, tetapi timeframe terbatas dan tidak boleh diekstrapolasi tanpa kehati-hatian.

Evidence strength:
High – Dataset konsisten secara internal selama enam bulan, tren stabil (bukan erratic), dan kesimpulan didukung oleh pola berulang, bukan efek satu periode.
`.trim();

export const OFFLINE_DEMO_EXPLANATION_MS = `
Summary:
Sepanjang tempoh enam bulan, Organic kekal sebagai pemacu hasil yang paling kuat dan paling cekap, dengan kadar penukaran tertinggi serta kos pemerolehan sifar. Paid Search menyumbang volum tambahan yang bermakna pada kos yang jauh lebih tinggi, manakala Social menghasilkan trafik yang meningkat dengan prestasi penukaran yang relatif lebih lemah.

What changed:
- Jumlah hasil meningkat secara stabil dari Januari hingga Jun, terutamanya didorong oleh pertumbuhan berterusan sesi Organic dan volum pesanan.
- Paid Search diskalakan secara beransur-ansur dalam tempoh ini, menyumbang pertumbuhan hasil secara incremental, sementara nilai pesanan purata kekal secara umum stabil merentas semua saluran.

Underlying observations:
- Organic secara konsisten menukar melebihi 3,3% setiap bulan, menghasilkan bahagian hasil terbesar tanpa perbelanjaan iklan.
- Paid Search mempunyai kecekapan penukaran lebih rendah tetapi menyediakan skala yang boleh dipercayai; keuntungan sensitif terhadap peningkatan kos iklan dan fulfilment apabila volum meningkat.
- Kadar penukaran Social bertambah baik sedikit dari masa ke masa tetapi kekal paling rendah, mengukuhkan peranan utama top-of-funnel berbanding penjanaan hasil secara langsung.

Why it likely changed:
Pertumbuhan hasil paling baik dijelaskan oleh peningkatan berterusan trafik Organic bersama kecekapan penukaran dan nilai pesanan yang stabil dari masa ke masa. Paid Search menambah volum incremental tetapi mengalami pulangan marginal yang menurun apabila spend meningkat. Tiada perubahan struktur yang mendadak dalam tingkah laku pelanggan yang ketara dalam jendela enam bulan.

What it means:
- Pertumbuhan keuntungan yang mampan kini paling bergantung pada prestasi Organic, di mana trafik tambahan secara konsisten diterjemahkan kepada hasil tanpa kos pemerolehan tambahan.
- Paid Search boleh digunakan untuk mempercepat pertumbuhan jika dikawal rapi, namun disiplin margin menjadi semakin penting apabila spend diskalakan. Social nampak lebih sesuai untuk awareness, discovery dan retargeting berbanding penukaran utama.

What NOT to conclude:
Analisis ini tidak bermaksud Paid Search atau Social perlu dikurangkan atau dibuang, atau bahawa pertumbuhan Organic akan berterusan tanpa had tanpa pelaburan. Corak konsisten, tetapi tempoh data terhad dan tidak wajar diekstrapolasi tanpa pertimbangan kritikal.

Evidence strength:
High – Dataset adalah konsisten secara dalaman merentasi enam bulan, trend stabil, dan kesimpulan disokong oleh corak berulang bukannya kesan satu tempoh.
`.trim();

export const OFFLINE_DEMO_EXPLANATION_TH = `
Summary:
ตลอดช่วงหกเดือน Organic ยังคงเป็นตัวขับเคลื่อนรายได้ที่แข็งแกร่งและมีประสิทธิภาพที่สุด โดยรวมอัตรา Conversion ที่สูงที่สุดเข้ากับต้นทุนการได้มาซึ่งลูกค้าเป็นศูนย์ Paid Search เพิ่มปริมาณแบบ incremental ที่มีนัยสำคัญ แต่ด้วยต้นทุนที่สูงกว่ามาก ขณะที่ Social สร้างทราฟฟิกเพิ่มขึ้นแต่มีประสิทธิภาพด้านการแปลงต่ำกว่าเมื่อเทียบกัน

What changed:
- รายได้รวมเพิ่มขึ้นอย่างสม่ำเสมอตั้งแต่มกราคมถึงมิถุนายน โดยขับเคลื่อนหลักจากการเติบโตต่อเนื่องของ Organic sessions และปริมาณออเดอร์
- Paid Search ถูกขยายอย่างค่อยเป็นค่อยไปตลอดช่วงเวลา ส่งผลให้รายได้เติบโตแบบ incremental ขณะที่มูลค่าออเดอร์เฉลี่ยยังคงค่อนข้างคงที่ในทุกช่องทาง

Underlying observations:
- Organic มีอัตรา Conversion สูงกว่า 3.3% อย่างสม่ำเสมอทุกเดือน และสร้างสัดส่วนรายได้มากที่สุดโดยไม่มีค่าโฆษณา
- Paid Search มีประสิทธิภาพการแปลงต่ำกว่า แต่สามารถสเกลได้อย่างน่าเชื่อถือ; ความสามารถทำกำไรไวต่อการเพิ่มขึ้นของค่าโฆษณาและต้นทุน fulfilment เมื่อปริมาณเพิ่มขึ้น
- อัตรา Conversion ของ Social ดีขึ้นเล็กน้อยตามเวลา แต่ยังคงต่ำที่สุด ตอกย้ำบทบาทหลักแบบ top-of-funnel มากกว่าการสร้างรายได้โดยตรง

Why it likely changed:
การเติบโตของรายได้อธิบายได้ดีที่สุดจากการเพิ่มขึ้นอย่างต่อเนื่องของทราฟฟิก Organic ร่วมกับประสิทธิภาพการแปลงและมูลค่าออเดอร์ที่คงที่ตลอดเวลา Paid Search เพิ่มปริมาณแบบ incremental แต่เผชิญผลตอบแทนส่วนเพิ่มที่ลดลงเมื่อ spend เพิ่มขึ้น ไม่พบการเปลี่ยนแปลงเชิงโครงสร้างแบบฉับพลันในพฤติกรรมลูกค้าภายในหน้าต่างหกเดือน

What it means:
- การเติบโตของกำไรแบบยั่งยืนในปัจจุบันพึ่งพา Organic มากที่สุด เพราะทราฟฟิกที่เพิ่มขึ้นแปลงเป็นรายได้ได้อย่างสม่ำเสมอโดยไม่มีต้นทุนการได้มาซึ่งลูกค้าเพิ่มเติม
- Paid Search สามารถเร่งการเติบโตได้หากควบคุมอย่างรอบคอบ แต่การรักษาวินัยด้านมาร์จินสำคัญมากขึ้นเมื่อ spend สเกลขึ้น Social ดูเหมาะกับการสร้างการรับรู้ การค้นพบ และการรีทาร์เก็ตมากกว่าการคอนเวิร์ตหลัก

What NOT to conclude:
การวิเคราะห์นี้ไม่ได้หมายความว่า Paid Search หรือ Social ควรถูกลดหรือถอดออก และไม่ได้หมายความว่า Organic จะเติบโตต่อไปได้ไม่สิ้นสุดโดยไม่ต้องลงทุน แม้รูปแบบจะสอดคล้องกัน แต่ช่วงเวลาของข้อมูลมีจำกัดและไม่ควรถูก extrapolate แบบไม่วิจารณญาณ

Evidence strength:
High – ชุดข้อมูลมีความสอดคล้องภายในตลอดหกเดือน แนวโน้มมีความเสถียร และข้อสรุปอิงจากรูปแบบที่เกิดซ้ำ ไม่ใช่ผลของช่วงเวลาเดียว
`.trim();

export const OFFLINE_DEMO_EXPLANATION_VI = `
Summary:
Trong giai đoạn sáu tháng, Organic vẫn là động lực doanh thu mạnh và hiệu quả nhất, kết hợp tỷ lệ chuyển đổi cao nhất với chi phí thu hút bằng 0. Paid Search mang lại khối lượng gia tăng đáng kể với chi phí cao hơn rõ rệt, trong khi Social tạo ra lưu lượng tăng dần nhưng hiệu quả chuyển đổi tương đối yếu hơn.

What changed:
- Tổng doanh thu tăng đều từ tháng 1 đến tháng 6, chủ yếu nhờ tăng trưởng bền vững về Organic sessions và số lượng đơn hàng.
- Paid Search được mở rộng dần trong giai đoạn này, đóng góp tăng trưởng doanh thu theo kiểu incremental, trong khi giá trị đơn hàng trung bình nhìn chung ổn định trên tất cả các kênh.

Underlying observations:
- Organic luôn chuyển đổi trên 3,3% ở mọi tháng, tạo ra phần doanh thu lớn nhất mà không cần chi tiêu quảng cáo.
- Paid Search có hiệu quả chuyển đổi thấp hơn nhưng cho khả năng mở rộng đáng tin cậy; lợi nhuận nhạy cảm với việc tăng chi phí quảng cáo và fulfilment khi khối lượng tăng.
- Tỷ lệ chuyển đổi của Social cải thiện nhẹ theo thời gian nhưng vẫn thấp nhất, củng cố vai trò chủ yếu top-of-funnel hơn là tạo doanh thu trực tiếp.

Why it likely changed:
Tăng trưởng doanh thu được giải thích tốt nhất bởi việc tăng bền vững lưu lượng Organic kết hợp với hiệu quả chuyển đổi và giá trị đơn hàng ổn định theo thời gian. Paid Search thêm khối lượng incremental nhưng gặp lợi suất biên giảm dần khi spend tăng. Không có thay đổi cấu trúc đột ngột trong hành vi khách hàng trong khung sáu tháng.

What it means:
- Tăng trưởng lợi nhuận bền vững hiện phụ thuộc nhiều nhất vào Organic, nơi lưu lượng tăng thêm chuyển hoá đều đặn thành doanh thu mà không phát sinh chi phí thu hút bổ sung.
- Paid Search có thể tăng tốc tăng trưởng nếu được kiểm soát chặt chẽ, nhưng kỷ luật biên lợi nhuận càng quan trọng khi spend mở rộng. Social có vẻ phù hợp hơn cho nhận biết, khám phá và retargeting hơn là chuyển đổi chính.

What NOT to conclude:
Phân tích này không hàm ý Paid Search hay Social cần giảm hoặc loại bỏ, cũng không khẳng định tăng trưởng Organic sẽ tiếp tục vô hạn mà không cần đầu tư. Dù các mẫu hình nhất quán, khung thời gian vẫn hạn chế và không nên ngoại suy thiếu thận trọng.

Evidence strength:
High – Dataset nhất quán nội bộ trong sáu tháng, xu hướng ổn định thay vì thất thường, và kết luận dựa trên các mẫu lặp lại chứ không phải hiệu ứng của một giai đoạn đơn lẻ.
`.trim();

export const OFFLINE_DEMO_EXPLANATION_JA = `
Summary:
6か月間を通じて、Organicは最も強力かつ効率的な売上ドライバーであり続けます。最高のコンバージョン率と獲得コスト0を両立しています。Paid Searchは大きな追加ボリュームを提供しますがコストは大幅に高く、Socialはトラフィック増加を生みつつも相対的にコンバージョンが弱めです。

What changed:
- 総売上は1月から6月にかけて着実に増加し、主にOrganicのセッション数と受注ボリュームの継続的な成長が要因です。
- Paid Searchは期間を通じて段階的にスケールし、売上成長にインクリメンタルに貢献しました。一方、平均注文額は全チャネルで概ね安定しています。

Underlying observations:
- Organicは全月で一貫して3.3%を上回ってコンバージョンし、広告費ゼロで最大の売上シェアを生みます。
- Paid Searchはコンバージョン効率が低いものの、安定したスケールを提供します。ボリューム増加に伴い、広告費とfulfilmentコストの上昇が利益に影響しやすいです。
- Socialのコンバージョン率は時間とともにわずかに改善しますが最も低く、直接の売上創出というより上流（top-of-funnel）での役割を示唆します。

Why it likely changed:
売上成長は、Organicトラフィックの持続的増加と、時間を通じた安定したコンバージョン効率・注文額によって最もよく説明できます。Paid Searchは追加ボリュームを生む一方で、支出増に伴い限界効果が逓減します。6か月の範囲では顧客行動の急激な構造変化は見られません。

What it means:
- 持続的な利益成長は現在、主にOrganicに依存しています。追加トラフィックが追加獲得コストなしに安定して売上へ転換します。
- Paid Searchは慎重にコントロールすれば成長を加速できますが、支出のスケールに伴いマージン規律がより重要になります。Socialは主要なコンバージョンよりも、認知・発見・リターゲティングに適しているように見えます。

What NOT to conclude:
この分析は、Paid SearchやSocialを削減/撤廃すべきだという意味ではなく、Organic成長が投資なしに無期限に続くことを示すものでもありません。傾向は一貫していますが、期間は限定的であり、無批判に外挿すべきではありません。

Evidence strength:
High – データセットは6か月にわたり内部整合性があり、トレンドは安定しており、結論は単発の期間効果ではなく反復するパターンに基づいています。
`.trim();

export const OFFLINE_DEMO_EXPLANATION_KO = `
Summary:
6개월 기간 동안 Organic은 가장 강력하고 효율적인 매출 동인으로 유지되며, 가장 높은 전환율과 0의 획득 비용을 결합합니다. Paid Search는 유의미한 추가 볼륨을 제공하지만 비용이 크게 높고, Social은 트래픽을 증가시키는 반면 전환 성과는 상대적으로 약합니다.

What changed:
- 총매출은 1월부터 6월까지 꾸준히 증가했으며, 주로 Organic 세션과 주문 볼륨의 지속적인 성장에 의해 견인되었습니다.
- Paid Search는 기간 동안 점진적으로 확장되며 매출 성장에 인크리멘털하게 기여했고, 평균 주문 금액은 전 채널에서 대체로 안정적으로 유지되었습니다.

Underlying observations:
- Organic은 모든 달에 걸쳐 3.3%를 상회하는 전환을 꾸준히 보이며, 광고비 지출 없이 매출의 가장 큰 비중을 만들어냅니다.
- Paid Search는 전환 효율이 낮지만 신뢰할 수 있는 스케일을 제공하며, 볼륨이 증가할수록 광고비와 fulfilment 비용 상승에 따라 수익성이 민감해집니다.
- Social의 전환율은 시간에 따라 소폭 개선되지만 여전히 가장 낮아, 직접 매출 창출보다는 상단 퍼널(top-of-funnel) 역할을 강화합니다.

Why it likely changed:
매출 성장은 Organic 트래픽의 지속적인 증가와 시간에 따른 전환 효율 및 주문 금액의 안정성으로 가장 잘 설명됩니다. Paid Search는 추가 볼륨을 제공하지만 spend가 증가할수록 한계효과가 감소합니다. 6개월 구간에서 고객 행동의 급격한 구조적 변화는 보이지 않습니다.

What it means:
- 지속 가능한 이익 성장은 현재 Organic 성과에 가장 크게 의존하며, 추가 트래픽이 추가 획득 비용 없이 일관되게 매출로 전환됩니다.
- Paid Search는 엄격히 관리하면 성장을 가속할 수 있지만, spend가 스케일될수록 마진 규율이 더 중요해집니다. Social은 주요 전환보다는 인지도, 발견, 리타게팅에 더 적합해 보입니다.

What NOT to conclude:
이 분석은 Paid Search나 Social을 줄이거나 제거해야 한다는 뜻이 아니며, Organic 성장이 투자 없이 무기한 지속된다는 의미도 아닙니다. 패턴은 일관적이지만 기간이 제한적이므로 비판 없이 외삽해서는 안 됩니다.

Evidence strength:
High – 데이터셋은 6개월 동안 내부적으로 일관되며, 트렌드는 변덕스럽지 않고 안정적이며, 결론은 단일 기간 효과가 아닌 반복 패턴에 의해 뒷받침됩니다.
`.trim();

export const OFFLINE_DEMO_EXPLANATION_ZH = `
Summary:
在六个月期间，Organic 仍然是最强且最高效的收入驱动因素，兼具最高的转化率与零获客成本。Paid Search 以显著更高的成本带来有意义的增量规模，而 Social 带来不断增长的流量，但转化表现相对较弱。

What changed:
- 总收入从一月到六月稳步增长，主要由 Organic 会话与订单量的持续增长驱动。
- Paid Search 在期间逐步扩张，带来增量收入增长，同时各渠道的平均客单价总体保持稳定。

Underlying observations:
- Organic 在所有月份都稳定高于 3.3% 的转化率，无需广告支出即可贡献最大收入份额。
- Paid Search 的转化效率较低，但规模可靠；随着量的增长，盈利能力对广告与 fulfilment 成本上升较为敏感。
- Social 的转化率随时间小幅改善，但仍为最低，进一步强化其更偏向漏斗上层（top-of-funnel）而非直接创造收入的角色。

Why it likely changed:
收入增长最可能由 Organic 流量的持续提升所解释，同时转化效率与客单价在时间维度上保持稳定。Paid Search 提供增量规模，但随着投放增加出现边际回报递减。在这六个月窗口内未见客户行为的突发性结构变化。

What it means:
- 可持续的利润增长目前最依赖 Organic 表现，增量流量能在不增加获客成本的情况下稳定转化为收入。
- 若严格控制，Paid Search 可用于加速增长，但投放规模扩大时，毛利/利润纪律会变得更加重要。Social 更适合用于品牌认知、发现与再营销，而非主要转化渠道。

What NOT to conclude:
本分析并不意味着应减少或移除 Paid Search 或 Social，也不意味着 Organic 增长会在没有投入的情况下无限持续。虽然模式一致，但时间范围有限，不应不加批判地外推。

Evidence strength:
High – 数据集在六个月内内部一致，趋势稳定而非波动，结论由重复模式支撑，而非单一时期效应。
`.trim();

// Backwards-compatible alias if your app currently imports this name
export const OFFLINE_DEMO_EXPLANATION = OFFLINE_DEMO_EXPLANATION_EN;

// Optional helper if you want to pick by uiLang
export function getOfflineDemoExplanation(lang?: string | null) {
  const l = (lang ?? "en").toLowerCase();

  if (l.startsWith("it")) return OFFLINE_DEMO_EXPLANATION_IT;
  if (l.startsWith("fr")) return OFFLINE_DEMO_EXPLANATION_FR;
  if (l.startsWith("es")) return OFFLINE_DEMO_EXPLANATION_ES;
  if (l.startsWith("de")) return OFFLINE_DEMO_EXPLANATION_DE;

  // Portuguese: pt / pt-br
  if (l === "pt" || l.startsWith("pt-")) return OFFLINE_DEMO_EXPLANATION_PT;

  if (l.startsWith("nl")) return OFFLINE_DEMO_EXPLANATION_NL;
  if (l.startsWith("sv")) return OFFLINE_DEMO_EXPLANATION_SV;

  // Norwegian: no / nb / nn
  if (l === "no" || l.startsWith("nb") || l.startsWith("nn")) return OFFLINE_DEMO_EXPLANATION_NO;

  if (l.startsWith("da")) return OFFLINE_DEMO_EXPLANATION_DA;
  if (l.startsWith("fi")) return OFFLINE_DEMO_EXPLANATION_FI;
  if (l.startsWith("pl")) return OFFLINE_DEMO_EXPLANATION_PL;
  if (l.startsWith("tr")) return OFFLINE_DEMO_EXPLANATION_TR;
  if (l.startsWith("el") || l.startsWith("gr")) return OFFLINE_DEMO_EXPLANATION_EL;
  if (l.startsWith("cs")) return OFFLINE_DEMO_EXPLANATION_CS;
  if (l.startsWith("hu")) return OFFLINE_DEMO_EXPLANATION_HU;
  if (l.startsWith("ro")) return OFFLINE_DEMO_EXPLANATION_RO;

  // Ukrainian / Russian
  if (l.startsWith("uk")) return OFFLINE_DEMO_EXPLANATION_UK;
  if (l.startsWith("ru")) return OFFLINE_DEMO_EXPLANATION_RU;

  // RTL languages (3)
  if (l.startsWith("ar")) return OFFLINE_DEMO_EXPLANATION_AR;
  if (l.startsWith("he") || l.startsWith("iw")) return OFFLINE_DEMO_EXPLANATION_HE;
  if (l.startsWith("ur")) return OFFLINE_DEMO_EXPLANATION_UR;

  // Others
  if (l.startsWith("hi")) return OFFLINE_DEMO_EXPLANATION_HI;
  if (l.startsWith("bn")) return OFFLINE_DEMO_EXPLANATION_BN;
  if (l.startsWith("id")) return OFFLINE_DEMO_EXPLANATION_ID;
  if (l.startsWith("ms")) return OFFLINE_DEMO_EXPLANATION_MS;
  if (l.startsWith("th")) return OFFLINE_DEMO_EXPLANATION_TH;
  if (l.startsWith("vi")) return OFFLINE_DEMO_EXPLANATION_VI;
  if (l.startsWith("ja")) return OFFLINE_DEMO_EXPLANATION_JA;
  if (l.startsWith("ko")) return OFFLINE_DEMO_EXPLANATION_KO;

  // Chinese: zh / zh-cn / zh-tw / etc.
  if (l.startsWith("zh")) return OFFLINE_DEMO_EXPLANATION_ZH;

  // Default to English for unsupported languages
  return OFFLINE_DEMO_EXPLANATION_EN;
}
